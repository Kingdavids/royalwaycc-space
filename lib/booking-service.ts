import "server-only";

import {
    ResultSetHeader,
    RowDataPacket,
} from "mysql2/promise";
import Stripe from "stripe";

import {
    BookingRequest,
    calculateBookingPrice,
    calculateEndTime,
} from "@/lib/booking-schema";
import { createBookingReference } from "@/lib/booking-reference";
import { withTransaction } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

export class BookingConflictError extends Error {
    constructor() {
        super(
            "That time is no longer available. Please select another time."
        );
        this.name = "BookingConflictError";
    }
}

export interface CreatedBookingCheckout {
    bookingId: number;
    bookingReference: string;
    checkoutUrl: string;
}

function toDatabaseBoolean(value: "yes" | "no") {
    return value === "yes" ? 1 : 0;
}

function formatMoney(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export async function createBookingCheckout(
    booking: BookingRequest
): Promise<CreatedBookingCheckout> {
    const endTime = calculateEndTime(
        booking.startTime,
        booking.hours
    );

    const price = calculateBookingPrice(
        booking.layout,
        booking.hours
    );

    const bookingReference =
        createBookingReference(booking.eventDate);

    const paymentExpiresAt = new Date(
        Date.now() + 30 * 60 * 1000
    );

    const pendingRecord = await withTransaction(
        async (connection) => {
            await connection.execute(
                `UPDATE bookings
                 SET status = 'EXPIRED'
                 WHERE status = 'PENDING_PAYMENT'
                   AND payment_expires_at IS NOT NULL
                   AND payment_expires_at <= UTC_TIMESTAMP()`
            );

            const [conflicts] =
                await connection.execute<RowDataPacket[]>(
                    `SELECT id
                     FROM bookings
                     WHERE event_date = ?
                       AND status IN (
                           'PENDING_PAYMENT',
                           'PAYMENT_PROCESSING',
                           'PAID',
                           'CONFIRMED'
                       )
                       AND start_time < ?
                       AND end_time > ?
                     LIMIT 1
                     FOR UPDATE`,
                    [
                        booking.eventDate,
                        endTime,
                        `${booking.startTime}:00`,
                    ]
                );

            if (conflicts.length > 0) {
                throw new BookingConflictError();
            }

            const [bookingResult] =
                await connection.execute<ResultSetHeader>(
                    `INSERT INTO bookings (
                        booking_reference,
                        first_name,
                        last_name,
                        email,
                        phone,
                        organization,
                        event_type,
                        event_date,
                        start_time,
                        end_time,
                        layout,
                        duration_hours,
                        guest_count,
                        alcohol_served,
                        alcohol_provider,
                        alcohol_permit_status,
                        outside_catering,
                        catering_company,
                        caterer_phone,
                        food_service_type,
                        on_site_cooking,
                        event_description,
                        special_requests,
                        hourly_rate_cents,
                        rental_subtotal_cents,
                        damage_deposit_cents,
                        total_amount_cents,
                        currency,
                        status,
                        payment_expires_at,
                        agreement_version,
                        agreement_accepted_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        ?, ?, 'PENDING_PAYMENT', ?, ?, UTC_TIMESTAMP()
                    )`,
                    [
                        bookingReference,
                        booking.firstName,
                        booking.lastName,
                        booking.email,
                        booking.phone,
                        booking.organization,
                        booking.eventType,
                        booking.eventDate,
                        `${booking.startTime}:00`,
                        endTime,
                        booking.layout,
                        booking.hours,
                        booking.guestCount,
                        toDatabaseBoolean(
                            booking.alcoholServed
                        ),
                        booking.alcoholProvider,
                        booking.alcoholPermitStatus,
                        toDatabaseBoolean(
                            booking.outsideCatering
                        ),
                        booking.cateringCompany,
                        booking.catererPhone,
                        booking.foodServiceType,
                        toDatabaseBoolean(
                            booking.onSiteCooking
                        ),
                        booking.eventDescription,
                        booking.specialRequests,
                        price.hourlyRateCents,
                        price.rentalSubtotalCents,
                        price.damageDepositCents,
                        price.totalAmountCents,
                        price.currency,
                        paymentExpiresAt,
                        booking.agreementVersion,
                    ]
                );

            const bookingId = bookingResult.insertId;

            const [paymentResult] =
                await connection.execute<ResultSetHeader>(
                    `INSERT INTO payments (
                        booking_id,
                        amount_cents,
                        currency,
                        payment_status
                    ) VALUES (?, ?, ?, 'PENDING')`,
                    [
                        bookingId,
                        price.totalAmountCents,
                        price.currency,
                    ]
                );

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
                    'BOOKING_CREATED',
                    NULL,
                    'PENDING_PAYMENT',
                    'CUSTOMER',
                    ?
                )`,
                [
                    bookingId,
                    JSON.stringify({
                        layout: booking.layout,
                        hours: booking.hours,
                        totalAmountCents:
                            price.totalAmountCents,
                    }),
                ]
            );

            return {
                bookingId,
                paymentId: paymentResult.insertId,
            };
        }
    );

    let checkoutSession: Stripe.Checkout.Session;

    try {
        checkoutSession =
            await stripe.checkout.sessions.create({
                mode: "payment",
                customer_email: booking.email,
                client_reference_id:
                    String(pendingRecord.bookingId),
                expires_at: Math.floor(
                    paymentExpiresAt.getTime() / 1000
                ),
                success_url:
                    `${env.siteUrl}/booking/success` +
                    "?session_id={CHECKOUT_SESSION_ID}",
                cancel_url:
                    `${env.siteUrl}/booking/cancel` +
                    `?reference=${encodeURIComponent(
                        bookingReference
                    )}`,
                metadata: {
                    bookingId: String(
                        pendingRecord.bookingId
                    ),
                    bookingReference,
                },
                payment_intent_data: {
                    metadata: {
                        bookingId: String(
                            pendingRecord.bookingId
                        ),
                        bookingReference,
                    },
                },
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency: "usd",
                            unit_amount:
                                price.rentalSubtotalCents,
                            product_data: {
                                name:
                                    booking.layout ===
                                    "theater"
                                        ? `Theater layout — ${booking.hours} hours`
                                        : `Round-table layout — ${booking.hours} hours`,
                                description:
                                    `${booking.eventDate}, ` +
                                    `${booking.startTime}–${endTime.slice(
                                        0,
                                        5
                                    )}`,
                            },
                        },
                    },
                    {
                        quantity: 1,
                        price_data: {
                            currency: "usd",
                            unit_amount:
                                price.damageDepositCents,
                            product_data: {
                                name:
                                    "Refundable damage deposit",
                                description:
                                    "Subject to the rental agreement and post-event inspection.",
                            },
                        },
                    },
                ],
            });
    } catch (error) {
        await withTransaction(async (connection) => {
            await connection.execute(
                `UPDATE bookings
                 SET status = 'CANCELLED'
                 WHERE id = ?
                   AND status = 'PENDING_PAYMENT'`,
                [pendingRecord.bookingId]
            );

            await connection.execute(
                `UPDATE payments
                 SET payment_status = 'CHECKOUT_FAILED'
                 WHERE id = ?`,
                [pendingRecord.paymentId]
            );

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
                    'CHECKOUT_CREATION_FAILED',
                    'PENDING_PAYMENT',
                    'CANCELLED',
                    'SYSTEM',
                    ?
                )`,
                [
                    pendingRecord.bookingId,
                    JSON.stringify({
                        message:
                            error instanceof Error
                                ? error.message
                                : "Unknown Stripe error",
                    }),
                ]
            );
        });

        throw error;
    }

    if (!checkoutSession.url) {
        throw new Error(
            "Stripe did not return a Checkout URL."
        );
    }

    await withTransaction(async (connection) => {
        await connection.execute(
            `UPDATE payments
             SET stripe_checkout_session_id = ?,
                 payment_status = 'CHECKOUT_CREATED'
             WHERE id = ?`,
            [
                checkoutSession.id,
                pendingRecord.paymentId,
            ]
        );

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
                'CHECKOUT_CREATED',
                'PENDING_PAYMENT',
                'PENDING_PAYMENT',
                'SYSTEM',
                ?
            )`,
            [
                pendingRecord.bookingId,
                JSON.stringify({
                    checkoutSessionId:
                        checkoutSession.id,
                    amount:
                        formatMoney(
                            price.totalAmountCents
                        ),
                }),
            ]
        );
    });

    return {
        bookingId: pendingRecord.bookingId,
        bookingReference,
        checkoutUrl: checkoutSession.url,
    };
}
