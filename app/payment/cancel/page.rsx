import Link from "next/link";
import {
    ArrowLeft,
    CreditCard,
    ShieldCheck,
} from "lucide-react";

export default function PaymentCancelledPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-5 py-12 text-[#171717] dark:bg-[#10120f] dark:text-white">
            <section className="w-full max-w-2xl rounded-[38px] border border-black/10 bg-white p-7 text-center shadow-[0_35px_100px_rgba(0,0,0,.1)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#a77c25]/10 text-[#9d7623] dark:bg-[#dfc477]/10 dark:text-[#dfc477]">
                    <CreditCard size={36} />
                </div>

                <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.22em] text-[#9d7623] dark:text-[#dfc477]">
                    Payment Cancelled
                </p>

                <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
                    No payment was completed.
                </h1>

                <p className="mx-auto mt-5 max-w-xl leading-8 text-[#6d665a] dark:text-white/60">
                    You exited Stripe Checkout before payment was completed.
                    Your card has not been charged by this Checkout Session.
                </p>

                <div className="mt-7 flex items-start gap-3 rounded-[22px] bg-[#f7f1e3] p-5 text-left text-sm leading-7 text-[#645c4e] dark:bg-white/[0.05] dark:text-white/60">
                    <ShieldCheck
                        size={20}
                        className="mt-1 shrink-0 text-[#9d7623] dark:text-[#dfc477]"
                    />

                    <p>
                        Return to the booking page to review your reservation
                        and begin payment again.
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/booking"
                        className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#171914] px-6 font-extrabold text-white dark:bg-[#dfc477] dark:text-[#171914]"
                    >
                        <ArrowLeft size={18} />
                        Return to Booking
                    </Link>

                    <a
                        href="mailto:bookings@royalwaycc.org"
                        className="flex min-h-14 flex-1 items-center justify-center rounded-full border border-[#d3c7ae] px-6 font-extrabold text-[#655021] dark:border-white/15 dark:text-[#dfc477]"
                    >
                        Contact Support
                    </a>
                </div>
            </section>
        </main>
    );
}