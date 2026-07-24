import Link from "next/link";
import {
    CalendarCheck,
    CheckCircle2,
    Home,
    Mail,
    ReceiptText,
} from "lucide-react";

import { stripe } from "@/lib/stripe";
import PaymentSuccessCleanup from
        "./payment-success-cleanup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SuccessPageProps = {
    searchParams: Promise<{
        session_id?: string;
    }>;
};

function formatMoney(
    amount: number | null,
    currency: string | null
) {
    if (amount === null) {
        return "Payment received";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (
            currency || "usd"
        ).toUpperCase(),
    }).format(amount / 100);
}

export default async function BookingSuccessPage({
                                                     searchParams,
                                                 }: SuccessPageProps) {
    const { session_id: sessionId } =
        await searchParams;

    if (!sessionId) {
        return (
            <main className="min-h-screen bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-[#f7f1e5]">
                <section className="mx-auto max-w-2xl rounded-[36px] border border-black/10 bg-white p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.08)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                        <ReceiptText size={30} />
                    </div>

                    <h1 className="mt-7 text-4xl font-bold tracking-[-0.04em]">
                        Payment reference missing
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg leading-7 text-[#6f685d] dark:text-white/60">
                        We could not find the Stripe
                        Checkout Session connected to this
                        page. Return to the booking page
                        and try again.
                    </p>

                    <Link
                        href="/book"
                        className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                    >
                        Return to Booking
                    </Link>
                </section>
            </main>
        );
    }

    try {
        const session =
            await stripe.checkout.sessions.retrieve(
                sessionId
            );

        const paymentSuccessful =
            session.payment_status === "paid";

        if (!paymentSuccessful) {
            return (
                <main className="min-h-screen bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-[#f7f1e5]">
                    <section className="mx-auto max-w-2xl rounded-[36px] border border-black/10 bg-white p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.08)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                            <ReceiptText size={30} />
                        </div>

                        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.25em] text-[#9d7623] dark:text-[#d8bd72]">
                            Payment processing
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em]">
                            Your payment is not confirmed
                            yet
                        </h1>

                        <p className="mx-auto mt-4 max-w-lg leading-7 text-[#6f685d] dark:text-white/60">
                            Stripe currently reports this
                            payment as{" "}
                            <strong>
                                {session.payment_status}
                            </strong>
                            . Do not submit another payment
                            until you confirm the result.
                        </p>

                        <Link
                            href="/book"
                            className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/15 px-7 font-extrabold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                        >
                            Return to Booking
                        </Link>
                    </section>
                </main>
            );
        }

        const customerEmail =
            session.customer_details?.email ||
            session.customer_email;

        const bookingReference =
            session.metadata?.bookingReference ||
            session.client_reference_id ||
            "Pending confirmation";

        return (
            <main className="min-h-screen bg-[#f7f4ed] px-5 py-10 text-[#171717] dark:bg-[#10120f] dark:text-[#f7f1e5] md:px-8 md:py-16">
                <PaymentSuccessCleanup />

                <section className="mx-auto max-w-3xl overflow-hidden rounded-[40px] border border-black/10 bg-white shadow-[0_35px_100px_rgba(0,0,0,.1)] dark:border-white/10 dark:bg-[#191b17]">
                    <div className="bg-[#171914] px-7 py-10 text-center text-white md:px-12 md:py-14">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d8bd72] text-[#171914] shadow-[0_0_0_10px_rgba(216,189,114,.12)]">
                            <CheckCircle2 size={42} />
                        </div>

                        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.28em] text-[#d8bd72]">
                            Payment successful
                        </p>

                        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
                            Your reservation payment was
                            received.
                        </h1>

                        <p className="mx-auto mt-5 max-w-xl leading-8 text-white/65">
                            Thank you for booking
                            RoyalwayCC Space. Your payment
                            has been confirmed, and your
                            reservation information has
                            been submitted for final
                            confirmation.
                        </p>
                    </div>

                    <div className="p-6 md:p-10">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <SuccessDetail
                                icon={
                                    <ReceiptText
                                        size={20}
                                    />
                                }
                                label="Amount Paid"
                                value={formatMoney(
                                    session.amount_total,
                                    session.currency
                                )}
                            />

                            <SuccessDetail
                                icon={
                                    <CalendarCheck
                                        size={20}
                                    />
                                }
                                label="Booking Reference"
                                value={bookingReference}
                            />

                            <SuccessDetail
                                icon={<Mail size={20} />}
                                label="Confirmation Email"
                                value={
                                    customerEmail ||
                                    "Provided during checkout"
                                }
                                fullWidth
                            />
                        </div>

                        <div className="mt-7 rounded-[28px] bg-[#f6f1e3] p-6 text-[#5e5545] dark:bg-white/[0.045] dark:text-white/65">
                            <h2 className="font-extrabold text-[#171717] dark:text-white">
                                What happens next?
                            </h2>

                            <p className="mt-3 leading-7">
                                RoyalwayCC Space will review
                                the reservation details. A
                                booking confirmation and
                                relevant event instructions
                                will be sent to the email
                                address used during
                                checkout.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/"
                                className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                            >
                                <Home size={18} />
                                Return to Venue
                            </Link>

                            <a
                                href="mailto:bookings@royalwaycc.org"
                                className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full border border-black/15 px-7 font-extrabold transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                            >
                                <Mail size={18} />
                                Contact Bookings
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        );
    } catch (error) {
        console.error(
            "Unable to retrieve Stripe Checkout Session:",
            error
        );

        return (
            <main className="min-h-screen bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-[#f7f1e5]">
                <section className="mx-auto max-w-2xl rounded-[36px] border border-black/10 bg-white p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.08)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-300/10 dark:text-red-300">
                        <ReceiptText size={30} />
                    </div>

                    <h1 className="mt-7 text-4xl font-bold tracking-[-0.04em]">
                        We could not verify the payment
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg leading-7 text-[#6f685d] dark:text-white/60">
                        Your payment information could not
                        be loaded. Do not submit another
                        payment. Contact the booking team
                        with your payment receipt.
                    </p>

                    <a
                        href="mailto:bookings@royalwaycc.org"
                        className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                    >
                        <Mail size={18} />
                        Contact Bookings
                    </a>
                </section>
            </main>
        );
    }
}

function SuccessDetail({
                           icon,
                           label,
                           value,
                           fullWidth = false,
                       }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    fullWidth?: boolean;
}) {
    return (
        <div
            className={`rounded-[24px] border border-black/8 bg-[#faf8f2] p-5 dark:border-white/10 dark:bg-white/[0.035] ${
                fullWidth ? "sm:col-span-2" : ""
            }`}
        >
            <div className="flex items-center gap-3 text-[#9d7623] dark:text-[#d8bd72]">
                {icon}

                <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
                    {label}
                </p>
            </div>

            <p className="mt-3 break-words font-bold">
                {value}
            </p>
        </div>
    );
}