"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const AGREEMENT_STORAGE_KEY =
    "royalwaycc-space-agreement-read-v1";

export default function AgreementReadConfirmation() {
    const confirmationRef =
        useRef<HTMLDivElement>(null);

    const [confirmed, setConfirmed] =
        useState(false);

    useEffect(() => {
        const alreadyConfirmed =
            window.localStorage.getItem(
                AGREEMENT_STORAGE_KEY
            ) === "true";

        if (alreadyConfirmed) {
            setConfirmed(true);
        }

        const confirmationSection =
            confirmationRef.current;

        if (!confirmationSection) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }

                window.localStorage.setItem(
                    AGREEMENT_STORAGE_KEY,
                    "true"
                );

                setConfirmed(true);
            },
            {
                threshold: 0.6,
            }
        );

        observer.observe(confirmationSection);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={confirmationRef}
            className="mt-10 rounded-[28px] border border-[#d8c99f] bg-[#fffaf0] p-6 shadow-[0_20px_55px_rgba(81,61,18,.08)] dark:border-[#d8bd72]/25 dark:bg-[#1b1d18] md:p-8"
        >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9d7623] dark:text-[#d8bd72]">
                Agreement completed
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                You have reached the end of the
                rental agreement.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d665a] dark:text-white/60">
                Your agreement checkbox is now
                unlocked. Return to the booking
                page and continue from where you
                stopped.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                    href="/booking"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                >
                    <Check size={18} />
                    Return to Booking
                </Link>

                {confirmed && (
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        Checkbox unlocked
                    </span>
                )}
            </div>
        </div>
    );
}