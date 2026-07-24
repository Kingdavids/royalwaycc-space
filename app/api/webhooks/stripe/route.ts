import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";
import Stripe from "stripe";

import { db } from "@/app/lib/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaymentRow extends RowDataPacket {
    id: number;
    booking_id: number;
    payment_status: string;
}

interface BookingRow extends RowDataPacket {
    id: number;
    status: string;
}

function getPaymentIntentId(
    paymentIntent:
        | string
        | Stripe.PaymentIntent
        | null
): string | null {
    if (!paymentIntent) {
        return null;
    }

    if (typeof paymentIntent === "string") {
        return paymentIntent;
    }

    return paymentIntent.id;
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
            {
                status: 400,
            }
        );
    }

    const webhookSecret =
        process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error(
            "STRIPE_WEBHOOK_SECRET is not configured."
        );

        return NextResponse.json(
            {
                error:
                    "Webhook configuration error.",
            },
            {
                status: 500,
            }
        );
    }

    const payload = await request.text();

    let event: Stripe.Event;

    try {
        event =
            stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret
            );
    } catch (error) {
        console.error(
            "Stripe webhook signature verification failed:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Invalid Stripe webhook signature.",
            },
            {
                status: 400,
            }
        );
    }

    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        /*
         * Store the webhook event.
         *
         * Stripe can send the same event more than once,
         * so stripe_event_id must remain unique.
         */
        await connection.execute(
            `INSERT INTO stripe_webhook_events (
                stripe_event_id,
                event_type,
                processing_status
            ) VALUES (?, ?, 'RECEIVED')
                 ON DUPLICATE KEY UPDATE
                                      event_type = VALUES(event_type)`,
            [
                event.id,
                event.type,
            ]
        );

        const [existingEvents] =
            await connection.execute<
                RowDataPacket[]
            >(
                `SELECT processing_status
                 FROM stripe_webhook_events
                 WHERE stripe_event_id = ?
                 LIMIT 1
                 FOR UPDATE`,
                [event.id]
            );

        const existingStatus =
            existingEvents[0]
                ?.processing_status;

        /*
         * Stripe retried an event that was already
         * successfully processed.
         */
        if (
            existingStatus === "PROCESSED"
        ) {
            await connection.commit();

            return NextResponse.json({
                received: true,
                duplicate: true,
            });
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session =
                    event.data
                        .object as Stripe.Checkout.Session;

                /*
                 * A completed Checkout Session is not always
                 * paid, for example with delayed payment
                 * methods. Only mark it paid when Stripe says
                 * payment_status is paid.
                 */
                if (
                    session.payment_status !==
                    "paid"
                ) {
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

                    await connection.commit();

                    return NextResponse.json({
                        received: true,
                        paymentStatus:
                        session.payment_status,
                    });
                }

                const paymentIntentId =
                    getPaymentIntentId(
                        session.payment_intent
                    );

                const [payments] =
                    await connection.execute<
                        PaymentRow[]
                    >(
                        `SELECT
                            id,
                            booking_id,
                            payment_status
                         FROM payments
                         WHERE stripe_checkout_session_id = ?
                         LIMIT 1
                         FOR UPDATE`,
                        [session.id]
                    );

                let payment =
                    payments[0];

                /*
                 * Fallback lookup using the booking ID stored
                 * in Stripe metadata/client_reference_id.
                 */
                if (!payment) {
                    const bookingIdText =
                        session.metadata
                            ?.bookingId ||
                        session.client_reference_id;

                    const bookingId =
                        bookingIdText
                            ? Number(
                                bookingIdText
                            )
                            : NaN;

                    if (
                        Number.isInteger(
                            bookingId
                        ) &&
                        bookingId > 0
                    ) {
                        const [fallbackPayments] =
                            await connection.execute<
                                PaymentRow[]
                            >(
                                `SELECT
                                    id,
                                    booking_id,
                                    payment_status
                                 FROM payments
                                 WHERE booking_id = ?
                                 ORDER BY id DESC
                                 LIMIT 1
                                 FOR UPDATE`,
                                [bookingId]
                            );

                        payment =
                            fallbackPayments[0];

                        if (payment) {
                            await connection.execute(
                                `UPDATE payments
                                 SET stripe_checkout_session_id = ?
                                 WHERE id = ?
                                   AND stripe_checkout_session_id
                                       IS NULL`,
                                [
                                    session.id,
                                    payment.id,
                                ]
                            );
                        }
                    }
                }

                if (!payment) {
                    throw new Error(
                        `No payment record was found for Stripe Checkout Session ${session.id}.`
                    );
                }

                const [bookings] =
                    await connection.execute<
                        BookingRow[]
                    >(
                        `SELECT id, status
                         FROM bookings
                         WHERE id = ?
                         LIMIT 1
                         FOR UPDATE`,
                        [
                            payment.booking_id,
                        ]
                    );

                const booking =
                    bookings[0];

                if (!booking) {
                    throw new Error(
                        `Booking ${payment.booking_id} was not found.`
                    );
                }

                const oldBookingStatus =
                    booking.status;

                const oldPaymentStatus =
                    payment.payment_status;

                await connection.execute(
                    `UPDATE payments
                     SET payment_status = 'PAID',
                         stripe_payment_intent_id =
                             COALESCE(
                                 ?,
                                 stripe_payment_intent_id
                             ),
                         paid_at =
                             COALESCE(
                                 paid_at,
                                 UTC_TIMESTAMP()
                             )
                     WHERE id = ?`,
                    [
                        paymentIntentId,
                        payment.id,
                    ]
                );

                await connection.execute(
                    `UPDATE bookings
                     SET status = 'PAID',
                         payment_expires_at = NULL
                     WHERE id = ?`,
                    [
                        payment.booking_id,
                    ]
                );

                /*
                 * Do not create duplicate payment activity if
                 * the same payment has already been marked paid.
                 */
                if (
                    oldPaymentStatus !==
                    "PAID" ||
                    oldBookingStatus !==
                    "PAID"
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
                            'PAID',
                            'SYSTEM',
                            'STRIPE_WEBHOOK',
                            ?
                        )`,
                        [
                            payment.booking_id,
                            oldBookingStatus,
                            JSON.stringify({
                                stripeEventId:
                                event.id,
                                checkoutSessionId:
                                session.id,
                                paymentIntentId,
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
                    "Royalway booking payment completed:",
                    {
                        bookingId:
                        payment.booking_id,
                        checkoutSessionId:
                        session.id,
                        paymentIntentId,
                    }
                );

                break;
            }

            case "checkout.session.expired": {
                const session =
                    event.data
                        .object as Stripe.Checkout.Session;

                const [payments] =
                    await connection.execute<
                        PaymentRow[]
                    >(
                        `SELECT
                            id,
                            booking_id,
                            payment_status
                         FROM payments
                         WHERE stripe_checkout_session_id = ?
                         LIMIT 1
                         FOR UPDATE`,
                        [session.id]
                    );

                const payment =
                    payments[0];

                if (
                    payment &&
                    payment.payment_status !==
                    "PAID"
                ) {
                    const [bookings] =
                        await connection.execute<
                            BookingRow[]
                        >(
                            `SELECT id, status
                             FROM bookings
                             WHERE id = ?
                             LIMIT 1
                             FOR UPDATE`,
                            [
                                payment.booking_id,
                            ]
                        );

                    const booking =
                        bookings[0];

                    await connection.execute(
                        `UPDATE payments
                         SET payment_status =
                                 'EXPIRED'
                         WHERE id = ?
                           AND payment_status <>
                               'PAID'`,
                        [payment.id]
                    );

                    await connection.execute(
                        `UPDATE bookings
                         SET status = 'EXPIRED'
                         WHERE id = ?
                           AND status =
                               'PENDING_PAYMENT'`,
                        [
                            payment.booking_id,
                        ]
                    );

                    if (
                        booking &&
                        booking.status ===
                        "PENDING_PAYMENT"
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
                                payment.booking_id,
                                JSON.stringify({
                                    stripeEventId:
                                    event.id,
                                    checkoutSessionId:
                                    session.id,
                                }),
                            ]
                        );
                    }
                }

                break;
            }

            default: {
                /*
                 * Other Stripe events are acknowledged but do
                 * not currently change the booking.
                 */
                console.log(
                    `Stripe event acknowledged: ${event.type}`
                );
            }
        }

        await connection.execute(
            `UPDATE stripe_webhook_events
             SET processing_status = 'PROCESSED',
                 processed_at = UTC_TIMESTAMP(),
                 error_message = NULL
             WHERE stripe_event_id = ?`,
            [event.id]
        );

        await connection.commit();

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        await connection.rollback();

        const message =
            error instanceof Error
                ? error.message
                : "Unknown webhook processing error.";

        console.error(
            "Stripe webhook database update failed:",
            error
        );

        /*
         * Record the failure outside the rolled-back
         * transaction so the error remains visible.
         */
        try {
            await connection.execute(
                `INSERT INTO stripe_webhook_events (
                    stripe_event_id,
                    event_type,
                    processing_status,
                    error_message
                ) VALUES (?, ?, 'FAILED', ?)
                ON DUPLICATE KEY UPDATE
                    processing_status = 'FAILED',
                    error_message = VALUES(error_message),
                    processed_at = NULL`,
                [
                    event.id,
                    event.type,
                    message,
                ]
            );
        } catch (logError) {
            console.error(
                "Could not save webhook failure:",
                logError
            );
        }

        return NextResponse.json(
            {
                error:
                    "Webhook processing failed.",
            },
            {
                status: 500,
            }
        );
    } finally {
        connection.release();
    }
}