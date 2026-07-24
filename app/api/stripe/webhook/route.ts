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

class DuplicateWebhookEvent extends Error {
    constructor() {
        super("Stripe webhook event already processed.");
        this.name = "DuplicateWebhookEvent";
    }
}

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

function paymentIntentIdFromSession(
    session: Stripe.Checkout.Session
): string | null {
    if (!session.payment_intent) {
        return null;
    }

    if (
        typeof session.payment_intent ===
        "string"
    ) {
        return session.payment_intent;
    }

    return session.payment_intent.id;
}

async function processCheckoutCompleted(
    session: Stripe.Checkout.Session
) {
    console.log(
        "PROCESSING CHECKOUT COMPLETED:",
        {
            sessionId: session.id,
            paymentStatus:
            session.payment_status,
            clientReferenceId:
            session.client_reference_id,
            metadata: session.metadata,
        }
    );

    /*
     * checkout.session.completed can also occur
     * before delayed payment methods are paid.
     */
    if (
        session.payment_status !== "paid"
    ) {
        console.log(
            "CHECKOUT COMPLETED BUT NOT YET PAID:",
            session.id
        );

        return;
    }

    const bookingId =
        bookingIdFromSession(session);

    if (!bookingId) {
        throw new Error(
            `Checkout session ${session.id} has no valid booking ID.`
        );
    }

    const paymentIntentId =
        paymentIntentIdFromSession(session);

    await withTransaction(
        async (connection) => {
            console.log(
                "DATABASE TRANSACTION OPENED FOR BOOKING:",
                bookingId
            );

            const [bookingRows] =
                await connection.execute<
                    RowDataPacket[]
                >(
                    `SELECT id, status
                     FROM bookings
                     WHERE id = ?
                     LIMIT 1
                     FOR UPDATE`,
                    [bookingId]
                );

            if (
                bookingRows.length === 0
            ) {
                throw new Error(
                    `Booking ${bookingId} was not found.`
                );
            }

            const oldBookingStatus =
                String(
                    bookingRows[0].status
                );

            const [paymentRows] =
                await connection.execute<
                    RowDataPacket[]
                >(
                    `SELECT
                        id,
                        payment_status,
                        stripe_checkout_session_id
                     FROM payments
                     WHERE booking_id = ?
                     ORDER BY id DESC
                     LIMIT 1
                     FOR UPDATE`,
                    [bookingId]
                );

            if (
                paymentRows.length === 0
            ) {
                throw new Error(
                    `No payment record was found for booking ${bookingId}.`
                );
            }

            const paymentId = Number(
                paymentRows[0].id
            );

            const oldPaymentStatus =
                String(
                    paymentRows[0]
                        .payment_status
                );

            const storedSessionId =
                paymentRows[0]
                    .stripe_checkout_session_id
                    ? String(
                        paymentRows[0]
                            .stripe_checkout_session_id
                    )
                    : null;

            console.log(
                "PAYMENT RECORD FOUND:",
                {
                    paymentId,
                    bookingId,
                    oldPaymentStatus,
                    storedSessionId,
                    receivedSessionId:
                    session.id,
                }
            );

            /*
             * Update using payment ID rather than relying
             * only on the session ID.
             */
            const [paymentResult] =
                await connection.execute<
                    ResultSetHeader
                >(
                    `UPDATE payments
                     SET stripe_checkout_session_id =
                             COALESCE(
                                 stripe_checkout_session_id,
                                 ?
                             ),
                         stripe_payment_intent_id =
                             COALESCE(
                                 ?,
                                 stripe_payment_intent_id
                             ),
                         payment_status = 'PAID',
                         paid_at = COALESCE(
                             paid_at,
                             UTC_TIMESTAMP()
                         )
                     WHERE id = ?`,
                    [
                        session.id,
                        paymentIntentId,
                        paymentId,
                    ]
                );

            if (
                paymentResult.affectedRows ===
                0
            ) {
                throw new Error(
                    `Payment ${paymentId} could not be updated.`
                );
            }

            const [bookingResult] =
                await connection.execute<
                    ResultSetHeader
                >(
                    `UPDATE bookings
                     SET status = 'CONFIRMED',
                         payment_expires_at = NULL
                     WHERE id = ?`,
                    [bookingId]
                );

            if (
                bookingResult.affectedRows ===
                0
            ) {
                throw new Error(
                    `Booking ${bookingId} could not be updated.`
                );
            }

            if (
                oldBookingStatus !==
                "CONFIRMED" ||
                oldPaymentStatus !== "PAID"
            ) {
                await connection.execute(
                    `INSERT INTO booking_activity (
                        booking_id,
                        action,
                        old_status,
                        new_status,
                        actor_type,
                        actor_identifier,
                        details_json
                    ) VALUES (
                        ?,
                        'PAYMENT_COMPLETED',
                        ?,
                        'CONFIRMED',
                        'SYSTEM',
                        'STRIPE_WEBHOOK',
                        ?
                    )`,
                    [
                        bookingId,
                        oldBookingStatus,
                        JSON.stringify({
                            checkoutSessionId:
                            session.id,
                            paymentIntentId,
                            paymentStatus:
                            session.payment_status,
                            previousPaymentStatus:
                            oldPaymentStatus,
                            amountTotal:
                            session.amount_total,
                            currency:
                            session.currency,
                        }),
                    ]
                );
            }

            console.log(
                "ROYALWAY BOOKING CONFIRMED:",
                {
                    bookingId,
                    paymentId,
                    checkoutSessionId:
                    session.id,
                    paymentIntentId,
                }
            );
        }
    );
}

async function processCheckoutExpired(
    session: Stripe.Checkout.Session
) {
    const bookingId =
        bookingIdFromSession(session);

    if (!bookingId) {
        console.log(
            "EXPIRED SESSION HAS NO BOOKING ID:",
            session.id
        );

        return;
    }

    await withTransaction(
        async (connection) => {
            const [bookingResult] =
                await connection.execute<
                    ResultSetHeader
                >(
                    `UPDATE bookings
                     SET status = 'EXPIRED'
                     WHERE id = ?
                       AND status =
                           'PENDING_PAYMENT'`,
                    [bookingId]
                );

            await connection.execute(
                `UPDATE payments
                 SET payment_status =
                         'EXPIRED'
                 WHERE booking_id = ?
                   AND stripe_checkout_session_id = ?
                   AND payment_status <> 'PAID'`,
                [
                    bookingId,
                    session.id,
                ]
            );

            if (
                bookingResult.affectedRows >
                0
            ) {
                await connection.execute(
                    `INSERT INTO booking_activity (
                        booking_id,
                        action,
                        old_status,
                        new_status,
                        actor_type,
                        actor_identifier,
                        details_json
                    ) VALUES (
                        ?,
                        'CHECKOUT_EXPIRED',
                        'PENDING_PAYMENT',
                        'EXPIRED',
                        'SYSTEM',
                        'STRIPE_WEBHOOK',
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
        }
    );
}

async function processEvent(
    event: Stripe.Event
) {
    console.log(
        "PROCESSING STRIPE EVENT:",
        event.type,
        event.id
    );

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
            console.log(
                "STRIPE EVENT ACKNOWLEDGED:",
                event.type
            );
            break;
    }
}

export async function POST(
    request: Request
) {
    console.log(
        "ROYALWAY WEBHOOK HIT:",
        new Date().toISOString()
    );

    const signature =
        request.headers.get(
            "stripe-signature"
        );

    if (!signature) {
        console.error(
            "WEBHOOK MISSING STRIPE SIGNATURE"
        );

        return NextResponse.json(
            {
                error:
                    "Missing Stripe signature.",
            },
            {
                status: 400,
            }
        );
    }

    let event: Stripe.Event;

    try {
        const rawBody =
            await request.text();

        event =
            stripe.webhooks.constructEvent(
                rawBody,
                signature,
                env.stripeWebhookSecret
            );

        console.log(
            "VERIFIED STRIPE EVENT:",
            event.type,
            event.id
        );
    } catch (error) {
        console.error(
            "STRIPE WEBHOOK VERIFICATION FAILED:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Invalid webhook signature.",
            },
            {
                status: 400,
            }
        );
    }

    try {
        console.log(
            "INSERTING WEBHOOK EVENT INTO DATABASE:",
            event.id
        );

        await withTransaction(
            async (connection) => {
                try {
                    await connection.execute(
                        `INSERT INTO stripe_webhook_events (
                            stripe_event_id,
                            event_type,
                            processing_status
                        ) VALUES (
                            ?,
                            ?,
                            'PROCESSING'
                        )`,
                        [
                            event.id,
                            event.type,
                        ]
                    );
                } catch (error) {
                    const mysqlError =
                        error as {
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
            }
        );

        console.log(
            "WEBHOOK EVENT SAVED:",
            event.id
        );

        await processEvent(event);

        await withTransaction(
            async (connection) => {
                await connection.execute(
                    `UPDATE stripe_webhook_events
                     SET processing_status =
                             'PROCESSED',
                         processed_at =
                             UTC_TIMESTAMP(),
                         error_message = NULL
                     WHERE stripe_event_id = ?`,
                    [event.id]
                );
            }
        );

        console.log(
            "WEBHOOK EVENT PROCESSED:",
            event.type,
            event.id
        );

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        if (
            error instanceof
            DuplicateWebhookEvent
        ) {
            console.log(
                "DUPLICATE WEBHOOK EVENT:",
                event.id
            );

            return NextResponse.json({
                received: true,
                duplicate: true,
            });
        }

        const errorMessage =
            error instanceof Error
                ? error.message
                : "Unknown processing error";

        console.error(
            "STRIPE WEBHOOK PROCESSING FAILED:",
            error
        );

        await withTransaction(
            async (connection) => {
                await connection.execute(
                    `INSERT INTO stripe_webhook_events (
                        stripe_event_id,
                        event_type,
                        processing_status,
                        error_message
                    ) VALUES (
                        ?,
                        ?,
                        'FAILED',
                        ?
                    )
                    ON DUPLICATE KEY UPDATE
                        processing_status =
                            'FAILED',
                        error_message =
                            VALUES(error_message),
                        processed_at = NULL`,
                    [
                        event.id,
                        event.type,
                        errorMessage.slice(
                            0,
                            3000
                        ),
                    ]
                );
            }
        ).catch((databaseError) => {
            console.error(
                "UNABLE TO RECORD WEBHOOK FAILURE:",
                databaseError
            );
        });

        return NextResponse.json(
            {
                error:
                    "Webhook processing failed.",
            },
            {
                status: 500,
            }
        );
    }
}