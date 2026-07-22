import {
    ArrowLeft,
    CircleAlert,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{
        reference?: string;
    }>;
}

export default async function BookingCancelPage({
    searchParams,
}: PageProps) {
    const { reference } = await searchParams;

    return (
        <main className="min-h-screen bg-[#f7f4ed] px-5 py-12 text-[#171914] dark:bg-[#10120f] dark:text-[#f7f1e5]">
            <section className="mx-auto max-w-2xl rounded-[38px] border border-black/8 bg-white p-7 shadow-[0_30px_100px_rgba(0,0,0,.1)] dark:border-white/10 dark:bg-[#191b17] md:p-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-300">
                    <CircleAlert size={34} />
                </span>

                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.22em] text-[#9d7623] dark:text-[#d8bd72]">
                    Checkout cancelled
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] md:text-6xl">
                    No payment was taken.
                </h1>

                <p className="mt-5 text-lg leading-8 text-[#676055] dark:text-white/60">
                    Your time is held only temporarily.
                    Return to the booking page to try
                    payment again or choose another
                    date and time.
                </p>

                {reference && (
                    <p className="mt-6 rounded-[22px] bg-[#f5efe0] p-5 font-bold dark:bg-[#24261f]">
                        Pending reference: {reference}
                    </p>
                )}

                <Link
                    href="/book"
                    className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white dark:bg-[#dfc477] dark:text-[#171914]"
                >
                    <ArrowLeft size={18} />
                    Return to Booking
                </Link>
            </section>
        </main>
    );
}
