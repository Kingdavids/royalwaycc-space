"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Armchair,
    Clock3,
    ShieldCheck,
    UsersRound,
} from "lucide-react";

import {
    calculateBookingTotal,
    hallPricing,
    type HallLayout,
} from "../lib/pricing";

export default function PricingCalculator() {
    const [layout, setLayout] = useState<HallLayout>("theater");
    const [hours, setHours] = useState(3);

    const estimate = useMemo(
        () => calculateBookingTotal(layout, hours),
        [layout, hours]
    );

    return (
        <section
            id="pricing"
            className="bg-[#f8f6f1] px-5 py-24 text-[#171717] dark:bg-[#11130f] dark:text-[#f5f0e5] md:px-8 md:py-32"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
                    {/* Left side */}
                    <div className="lg:sticky lg:top-28">
                        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#9d7623] dark:text-[#d8bd72]">
                            Transparent Pricing
                        </p>

                        <h2 className="mt-5 max-w-xl text-5xl font-bold leading-[0.94] tracking-[-0.05em] md:text-7xl">
                            Plan your event with confidence.
                        </h2>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-[#6f695e] dark:text-[#bdb6a8]">
                            Every reservation has a three-hour minimum. Choose your preferred
                            hall arrangement and rental duration to see an instant estimate
                            before starting your reservation.
                        </p>

                        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.06)] dark:border-white/10 dark:bg-white/[0.05]">
                                <Armchair className="text-[#a77c25]" />

                                <p className="mt-5 text-2xl font-bold">
                                    Theater Setting
                                </p>

                                <p className="mt-2 text-[#716a5d] dark:text-white/60">
                                    Up to 100 chairs
                                </p>

                                <p className="mt-5 text-3xl font-extrabold">
                                    $105
                                    <span className="ml-1 text-sm font-semibold text-[#716a5d] dark:text-white/50">
                    /hour
                  </span>
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.06)] dark:border-white/10 dark:bg-white/[0.05]">
                                <UsersRound className="text-[#a77c25]" />

                                <p className="mt-5 text-2xl font-bold">
                                    Round-Table Setting
                                </p>

                                <p className="mt-2 text-[#716a5d] dark:text-white/60">
                                    Up to 50 guests
                                </p>

                                <p className="mt-5 text-3xl font-extrabold">
                                    $145
                                    <span className="ml-1 text-sm font-semibold text-[#716a5d] dark:text-white/50">
                    /hour
                  </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick estimate */}
                    <div className="rounded-[38px] border border-black/8 bg-white p-5 shadow-[0_35px_100px_rgba(0,0,0,.11)] dark:border-white/10 dark:bg-[#191b17] md:p-9">
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#9d7623] dark:text-[#d8bd72]">
                                Plan Your Booking
                            </p>

                            <h3 className="mt-3 text-4xl font-bold tracking-[-0.05em] md:text-5xl">
                                Start with a quick estimate.
                            </h3>

                            <p className="mt-4 max-w-xl text-base leading-7 text-[#746d61] dark:text-white/50">
                                Select your setup and rental duration. You&apos;ll choose your
                                date, provide your event details, and check availability on the
                                next page.
                            </p>
                        </div>

                        {/* Hall setup */}
                        <div className="mt-9">
                            <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#776f61] dark:text-white/55">
                                Select Hall Setup
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setLayout("theater")}
                                    className={`rounded-[24px] border p-5 text-left transition ${
                                        layout === "theater"
                                            ? "border-[#c9a43e] bg-[#fbf4dc] shadow-[0_15px_40px_rgba(167,124,37,.12)] dark:bg-[#302b1c]"
                                            : "border-black/10 bg-[#faf9f6] hover:border-[#c9a43e]/60 dark:border-white/10 dark:bg-white/[0.04]"
                                    }`}
                                >
                                    <Armchair className="text-[#a77c25]" />

                                    <p className="mt-5 text-xl font-bold">
                                        {hallPricing.theater.name}
                                    </p>

                                    <p className="mt-1 text-sm text-[#746d61] dark:text-white/55">
                                        {hallPricing.theater.capacity}
                                    </p>

                                    <p className="mt-4 font-extrabold">
                                        $105/hour
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setLayout("round-table")}
                                    className={`rounded-[24px] border p-5 text-left transition ${
                                        layout === "round-table"
                                            ? "border-[#c9a43e] bg-[#fbf4dc] shadow-[0_15px_40px_rgba(167,124,37,.12)] dark:bg-[#302b1c]"
                                            : "border-black/10 bg-[#faf9f6] hover:border-[#c9a43e]/60 dark:border-white/10 dark:bg-white/[0.04]"
                                    }`}
                                >
                                    <UsersRound className="text-[#a77c25]" />

                                    <p className="mt-5 text-xl font-bold">
                                        {hallPricing["round-table"].name}
                                    </p>

                                    <p className="mt-1 text-sm text-[#746d61] dark:text-white/55">
                                        {hallPricing["round-table"].capacity}
                                    </p>

                                    <p className="mt-4 font-extrabold">
                                        $145/hour
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="mt-8">
                            <label
                                htmlFor="rental-hours"
                                className="flex items-center justify-between gap-4"
                            >
                <span className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#776f61] dark:text-white/55">
                  Rental Duration
                </span>

                                <span className="rounded-full bg-[#f0e7cd] px-4 py-2 text-sm font-extrabold text-[#6d5118] dark:bg-[#332e20] dark:text-[#ead89d]">
                  {hours} hours
                </span>
                            </label>

                            <input
                                id="rental-hours"
                                type="range"
                                min="3"
                                max="12"
                                step="1"
                                value={hours}
                                onChange={(event) =>
                                    setHours(Number(event.target.value))
                                }
                                className="mt-6 w-full accent-[#a77c25]"
                            />

                            <div className="mt-3 flex justify-between text-sm font-semibold text-[#81796d] dark:text-white/45">
                                <span>3-hour minimum</span>
                                <span>12 hours</span>
                            </div>
                        </div>

                        {/* Estimate */}
                        <div className="mt-9 rounded-[30px] bg-[#171914] p-6 text-white dark:bg-[#0d0e0c] md:p-8">
                            <div className="space-y-4 border-b border-white/10 pb-6">
                                <div className="flex justify-between gap-5">
                  <span className="text-white/60">
                    {hallPricing[layout].name}
                  </span>

                                    <span className="font-bold">
                    ${estimate.hourlyRate}/hour
                  </span>
                                </div>

                                <div className="flex justify-between gap-5">
                  <span className="text-white/60">
                    Rental subtotal · {estimate.hours} hours
                  </span>

                                    <span className="font-bold">
                    ${estimate.rentalSubtotal}
                  </span>
                                </div>

                                <div className="flex justify-between gap-5">
                  <span className="flex items-center gap-2 text-white/60">
                    <ShieldCheck size={17} />
                    Refundable damage deposit
                  </span>

                                    <span className="font-bold">
                    ${estimate.damageDeposit}
                  </span>
                                </div>
                            </div>

                            <div className="flex items-end justify-between gap-6 pt-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8bd72]">
                                        Estimated Total
                                    </p>

                                    <p className="mt-2 text-5xl font-extrabold tracking-[-0.06em]">
                                        ${estimate.total}
                                    </p>
                                </div>

                                <Clock3
                                    className="hidden text-[#d8bd72] sm:block"
                                    size={34}
                                />
                            </div>
                        </div>

                        {/* Continue */}
                        <Link
                            href={`/book?layout=${layout}&hours=${hours}`}
                            className="group mt-6 flex min-h-16 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#b98a28] to-[#e8d18e] px-7 text-center font-extrabold text-[#171717] shadow-[0_18px_45px_rgba(167,124,37,.24)] transition hover:-translate-y-1"
                        >
                            Continue to Booking

                            <ArrowRight
                                size={19}
                                className="transition group-hover:translate-x-1"
                            />
                        </Link>

                        <p className="mt-4 text-center text-sm leading-6 text-[#777065] dark:text-white/45">
                            No payment is required yet. You&apos;ll confirm your event details
                            and check availability on the next page.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}