import Link from "next/link";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
    ReceiptText,
} from "lucide-react";

import { stripe } from "@/app/lib/stripe";

type SuccessPageProps = {
    searchParams: Promise<{
        session_id?: string;
    }>;
};

export default async function PaymentSuccessPage({
                                                     searchParams,
                                                 }: SuccessPageProps) {
    const { session_id: sessionId } = await searchParams;

    if (!sessionId) {
        return <InvalidPaymentPage />;
    }

    try {
        const session =
            await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return (
                <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-white">
                    <section className="w-full max-w-2xl rounded-[36px] border border-black/10 bg-white p-7 text-center shadow-[0_35px_100px_rgba(0,0,0,.1)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                        <ReceiptText
                            size={52}
                            className="mx-auto text-[#a77c25]"
                        />

                        <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.04em]">
                            Payment is still processing
                        </h1>

                        <p className="mt-4 leading-7 text-[#6f685d] dark:text-white/60">
                            Stripe has not marked this payment as completed.
                            Please check your email or contact our booking team
                            before trying another payment.
                        </p>

                        <Link
                            href="/"
                            className="mt-7 inline-flex min-h-13 items-center justify-center rounded-full bg-[#171914] px-7 font-extrabold text-white dark:bg-[#dfc477] dark:text-[#171914]"
                        >
                            Return to RoyalwayCC Space
                        </Link>
                    </section>
                </main>
            );
        }

        const metadata = session.metadata;
        const totalPaid =
            typeof session.amount_total === "number"
                ? (session.amount_total / 100).toFixed(2)
                : "0.00";

        return (
            <main className="min-h-screen bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-white">
                <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-[38px] border border-black/10 bg-white shadow-[0_35px_100px_rgba(0,0,0,.1)] dark:border-white/10 dark:bg-[#191b17]">
                    <div className="bg-[#171914] px-7 py-10 text-center text-white md:px-12">
                        <CheckCircle2
                            size={66}
                            className="mx-auto text-[#dfc477]"
                        />

                        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[#dfc477]">
                            Payment Successful
                        </p>

                        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
                            Thank you for your reservation.
                        </h1>

                        <p className="mx-auto mt-5 max-w-xl leading-7 text-white/60">
                            Your payment was received. RoyalwayCC will review
                            your event details and send the final reservation
                            confirmation.
                        </p>
                    </div>

                    <div className="p-7 md:p-11">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <DetailCard
                                icon={<ReceiptText size={20} />}
                                label="Amount paid"
                                value={`$${totalPaid} CAD`}
                            />

                            <DetailCard
                                icon={<Mail size={20} />}
                                label="Receipt email"
                                value={
                                    session.customer_details?.email ||
                                    session.customer_email ||
                                    "Provided during checkout"
                                }
                            />

                            <DetailCard
                                icon={<CalendarDays size={20} />}
                                label="Event date"
                                value={
                                    metadata?.eventDate ||
                                    "To be confirmed"
                                }
                            />

                            <DetailCard
                                icon={<Clock3 size={20} />}
                                label="Start time"
                                value={
                                    metadata?.startTime ||
                                    "To be confirmed"
                                }
                            />
                        </div>

                        <div className="mt-7 rounded-[24px] bg-[#f7f1e3] p-5 text-sm leading-7 text-[#645c4e] dark:bg-white/[0.05] dark:text-white/60">
                            <strong className="text-[#28241d] dark:text-white">
                                Important:
                            </strong>{" "}
                            successful payment records the booking request, but
                            the reservation is finalized after RoyalwayCC
                            approves the event and confirms availability.
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/"
                                className="flex min-h-14 flex-1 items-center justify-center rounded-full bg-[#171914] px-6 font-extrabold text-white dark:bg-[#dfc477] dark:text-[#171914]"
                            >
                                Return to Venue
                            </Link>

                            <a
                                href="mailto:bookings@royalwaycc.org"
                                className="flex min-h-14 flex-1 items-center justify-center rounded-full border border-[#d3c7ae] px-6 font-extrabold text-[#655021] dark:border-white/15 dark:text-[#dfc477]"
                            >
                                Contact Booking Team
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        );
    } catch (error) {
        console.error("Unable to retrieve Stripe Session:", error);
        return <InvalidPaymentPage />;
    }
}

function DetailCard({
                        icon,
                        label,
                        value,
                    }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-[22px] border border-black/8 p-5 dark:border-white/10">
            <span className="text-[#a77c25] dark:text-[#dfc477]">
                {icon}
            </span>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-[#81796c] dark:text-white/40">
                {label}
            </p>

            <p className="mt-2 break-words font-extrabold">
                {value}
            </p>
        </div>
    );
}

function InvalidPaymentPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-white">
            <section className="w-full max-w-xl rounded-[34px] bg-white p-8 text-center shadow-xl dark:bg-[#191b17]">
                <h1 className="text-3xl font-extrabold">
                    Payment details unavailable
                </h1>

                <p className="mt-4 leading-7 text-[#6c655a] dark:text-white/60">
                    We could not verify a Stripe Checkout Session from this
                    page. Contact bookings@royalwaycc.org if payment left your
                    account.
                </p>

                <Link
                    href="/"
                    className="mt-7 inline-flex min-h-13 items-center justify-center rounded-full bg-[#171914] px-7 font-extrabold text-white dark:bg-[#dfc477] dark:text-[#171914]"
                >
                    Return Home
                </Link>
            </section>
        </main>
    );
}