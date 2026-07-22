import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
} from "lucide-react";
import Link from "next/link";
import { RowDataPacket } from "mysql2/promise";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{
        session_id?: string;
    }>;
}

interface ConfirmationRow extends RowDataPacket {
    booking_reference: string;
    first_name: string;
    email: string;
    event_date: string;
    start_time: string;
    end_time: string;
    layout: string;
    total_amount_cents: number;
    currency: string;
    status: string;
    payment_status: string;
}

function formatTime(value: string) {
    return value.slice(0, 5);
}

function formatMoney(
    cents: number,
    currency: string
) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(cents / 100);
}

export default async function BookingSuccessPage({
    searchParams,
}: PageProps) {
    const { session_id: sessionId } =
        await searchParams;

    let confirmation:
        | ConfirmationRow
        | undefined;

    if (sessionId) {
        const [rows] =
            await db.execute<ConfirmationRow[]>(
                `SELECT
                    b.booking_reference,
                    b.first_name,
                    b.email,
                    DATE_FORMAT(
                        b.event_date,
                        '%Y-%m-%d'
                    ) AS event_date,
                    TIME_FORMAT(
                        b.start_time,
                        '%H:%i:%s'
                    ) AS start_time,
                    TIME_FORMAT(
                        b.end_time,
                        '%H:%i:%s'
                    ) AS end_time,
                    b.layout,
                    b.total_amount_cents,
                    b.currency,
                    b.status,
                    p.payment_status
                 FROM bookings b
                 INNER JOIN payments p
                    ON p.booking_id = b.id
                 WHERE p.stripe_checkout_session_id = ?
                 LIMIT 1`,
                [sessionId]
            );

        confirmation = rows[0];
    }

    const isConfirmed =
        confirmation?.status === "CONFIRMED" &&
        confirmation?.payment_status === "PAID";

    return (
        <main className="min-h-screen bg-[#f7f4ed] px-5 py-12 text-[#171914] dark:bg-[#10120f] dark:text-[#f7f1e5]">
            <section className="mx-auto max-w-3xl rounded-[38px] border border-black/8 bg-white p-7 shadow-[0_30px_100px_rgba(0,0,0,.1)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-300">
                    <CheckCircle2 size={34} />
                </span>

                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.22em] text-[#9d7623] dark:text-[#d8bd72]">
                    Payment received
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
                    Thank you
                    {confirmation
                        ? `, ${confirmation.first_name}.`
                        : "."}
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#676055] dark:text-white/60">
                    {isConfirmed
                        ? "Your RoyalwayCC Space reservation is confirmed."
                        : "Stripe received your payment. We are completing the final confirmation now; refresh this page shortly if the status is still processing."}
                </p>

                {confirmation && (
                    <div className="mt-9 grid gap-4 rounded-[28px] bg-[#f5efe0] p-6 dark:bg-[#24261f] md:grid-cols-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8a806d]">
                                Booking reference
                            </p>
                            <p className="mt-2 text-xl font-extrabold">
                                {
                                    confirmation.booking_reference
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8a806d]">
                                Status
                            </p>
                            <p className="mt-2 text-xl font-extrabold">
                                {isConfirmed
                                    ? "Confirmed"
                                    : "Processing"}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <CalendarDays
                                className="mt-1"
                                size={19}
                            />
                            <div>
                                <p className="font-bold">
                                    {
                                        confirmation.event_date
                                    }
                                </p>
                                <p className="text-sm text-[#766f62] dark:text-white/50">
                                    {
                                        confirmation.layout
                                    }{" "}
                                    layout
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Clock3
                                className="mt-1"
                                size={19}
                            />
                            <div>
                                <p className="font-bold">
                                    {formatTime(
                                        confirmation.start_time
                                    )}{" "}
                                    –{" "}
                                    {formatTime(
                                        confirmation.end_time
                                    )}
                                </p>
                                <p className="text-sm text-[#766f62] dark:text-white/50">
                                    {formatMoney(
                                        confirmation.total_amount_cents,
                                        confirmation.currency
                                    )}{" "}
                                    paid
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex items-start gap-3 rounded-[24px] border border-[#d8bd72]/40 p-5">
                    <Mail
                        className="mt-1 shrink-0 text-[#a77c25]"
                        size={20}
                    />
                    <p className="leading-7 text-[#676055] dark:text-white/60">
                        Keep your booking reference.
                        Reservation communication will
                        be sent to{" "}
                        <strong>
                            {confirmation?.email ||
                                "the email used at checkout"}
                        </strong>
                        .
                    </p>
                </div>

                <Link
                    href="/"
                    className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-[#171914] px-7 font-extrabold text-white dark:bg-[#dfc477] dark:text-[#171914]"
                >
                    Return Home
                </Link>
            </section>
        </main>
    );
}
