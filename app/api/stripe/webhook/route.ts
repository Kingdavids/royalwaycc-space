import { NextResponse } from "next/server";
import {
    ResultSetHeader,
    RowDataPacket,
} from "mysql2/promise";
import Stripe from "stripe";

import { withTransaction } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class DuplicateWebhookEvent extends Error {}

function bookingIdFromSession(
    session: Stripe.Checkout.Session
): number | null {
    const value =
        session.metadata?.bookingId ||
        session.client_reference_id;

    const bookingId = Number(value);

    return Number.isInteger(bookingId) &&
        bookingId > 0
        ? bookingId
        : null;
}

async function processCheckoutCompleted(
    session: Stripe.Checkout.Session
) {
    const bookingId =
        bookingIdFromSession(session);

    if (!bookingId) {
        throw new Error(
            "Checkout session has no valid booking ID."
        );
    }

    const paymentIntentId =
        typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

    await withTransaction(async (connection) => {
        const [bookingRows] =
            await connection.execute<RowDataPacket[]>(
                `SELECT status
                 FROM bookings
                 WHERE id = ?
                 LIMIT 1
                 FOR UPDATE`,
                [bookingId]
            );

        if (bookingRows.length === 0) {
            throw new Error(
                `Booking ${bookingId} was not found.`
            );
        }

        const oldStatus = String(
            bookingRows[0].status
        );

        await connection.execute(
            `UPDATE payments
             SET stripe_payment_intent_id = ?,
                 payment_status = 'PAID',
                 paid_at = COALESCE(
                     paid_at,
                     UTC_TIMESTAMP()
                 )
             WHERE booking_id = ?
               AND stripe_checkout_session_id = ?`,
            [
                paymentIntentId,
                bookingId,
                session.id,
            ]
        );

        await connection.execute(
            `UPDATE bookings
             SET status = 'CONFIRMED'
             WHERE id = ?`,
            [bookingId]
        );

        if (oldStatus !== "CONFIRMED") {
            await connection.execute(
                `INSERT INTO booking_activity (
                    booking_id,
                    action,
                    old_status,
                    new_status,
                    actor_type,
                    details_json
                ) VALUES (
                    ?,
                    'PAYMENT_COMPLETED',
                    ?,
                    'CONFIRMED',
                    'STRIPE',
                    ?
                )`,
                [
                    bookingId,
                    oldStatus,
                    JSON.stringify({
                        checkoutSessionId:
                            session.id,
                        paymentIntentId,
                        paymentStatus:
                            session.payment_status,
                    }),
                ]
            );
        }
    });
}

async function processCheckoutExpired(
    session: Stripe.Checkout.Session
) {
    const bookingId =
        bookingIdFromSession(session);

    if (!bookingId) {
        return;
    }

    await withTransaction(async (connection) => {
        const [result] =
            await connection.execute<ResultSetHeader>(
                `UPDATE bookings
                 SET status = 'EXPIRED'
                 WHERE id = ?
                   AND status = 'PENDING_PAYMENT'`,
                [bookingId]
            );

        await connection.execute(
            `UPDATE payments
             SET payment_status = 'EXPIRED'
             WHERE booking_id = ?
               AND stripe_checkout_session_id = ?
               AND payment_status <> 'PAID'`,
            [bookingId, session.id]
        );

        if (result.affectedRows > 0) {
            await connection.execute(
                `INSERT INTO booking_activity (
                    booking_id,
                    action,
                    old_status,
                    new_status,
                    actor_type,
                    details_json
                ) VALUES (
                    ?,
                    'CHECKOUT_EXPIRED',
                    'PENDING_PAYMENT',
                    'EXPIRED',
                    'STRIPE',
                    ?
                )`,
                [
                    bookingId,
                    JSON.stringify({
                        checkoutSessionId:
                            session.id,
                    }),
                ]
            );
        }
    });
}

async function processEvent(event: Stripe.Event) {
    switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded":
            await processCheckoutCompleted(
                event.data
                    .object as Stripe.Checkout.Session
            );
            break;

        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
            await processCheckoutExpired(
                event.data
                    .object as Stripe.Checkout.Session
            );
            break;

        default:
            break;
    }
}

export async function POST(request: Request) {
    const signature =
        request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            {
                error:
                    "Missing Stripe signature.",
            },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        const rawBody = await request.text();

        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            env.stripeWebhookSecret
        );
    } catch (error) {
        console.error(
            "Stripe webhook verification failed:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Invalid webhook signature.",
            },
            { status: 400 }
        );
    }

    try {
        await withTransaction(async (connection) => {
            try {
                await connection.execute(
                    `INSERT INTO stripe_webhook_events (
                        stripe_event_id,
                        event_type,
                        processing_status
                    ) VALUES (?, ?, 'PROCESSING')`,
                    [event.id, event.type]
                );
            } catch (error) {
                const mysqlError = error as {
                    code?: string;
                };

                if (
                    mysqlError.code ===
                    "ER_DUP_ENTRY"
                ) {
                    throw new DuplicateWebhookEvent();
                }

                throw error;
            }
        });

        await processEvent(event);

        await withTransaction(async (connection) => {
            await connection.execute(
                `UPDATE stripe_webhook_events
                 SET processing_status = 'PROCESSED',
                     processed_at = UTC_TIMESTAMP(),
                     error_message = NULL
                 WHERE stripe_event_id = ?`,
                [event.id]
            );
        });

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        if (error instanceof DuplicateWebhookEvent) {
            return NextResponse.json({
                received: true,
                duplicate: true,
            });
        }

        console.error(
            "Stripe webhook processing failed:",
            error
        );

        await withTransaction(async (connection) => {
            await connection.execute(
                `UPDATE stripe_webhook_events
                 SET processing_status = 'FAILED',
                     error_message = ?
                 WHERE stripe_event_id = ?`,
                [
                    error instanceof Error
                        ? error.message.slice(0, 3000)
                        : "Unknown processing error",
                    event.id,
                ]
            );
        }).catch((databaseError) => {
            console.error(
                "Unable to record webhook failure:",
                databaseError
            );
        });

        return NextResponse.json(
            {
                error:
                    "Webhook processing failed.",
            },
            { status: 500 }
        );
    }
}
