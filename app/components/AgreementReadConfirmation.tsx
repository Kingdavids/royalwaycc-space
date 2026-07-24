"use client";

import { Check } from "lucide-react";
import { useState } from "react";

const AGREEMENT_STORAGE_KEY =
    "royalwaycc-space-agreement-read-v2";

export default function AgreementReadConfirmation() {
    const [confirmed, setConfirmed] = useState(false);

    function confirmAgreementRead() {
        if (confirmed) {
            return;
        }

        window.localStorage.setItem(
            AGREEMENT_STORAGE_KEY,
            Date.now().toString()
        );

        setConfirmed(true);
    }

    return (
        <div className="mt-10 rounded-[28px] border border-[#d8c99f] bg-[#fffaf0] p-6 shadow-[0_20px_55px_rgba(81,61,18,.08)] dark:border-[#d8bd72]/25 dark:bg-[#1b1d18] md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9d7623] dark:text-[#d8bd72]">
                Final acknowledgement
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                Confirm that you have read the agreement.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d665a] dark:text-white/60">
                By selecting the button below, you confirm
                that you have reviewed the complete
                RoyalwayCC Space Rental Agreement.
            </p>

            <button
                type="button"
                disabled={confirmed}
                onClick={confirmAgreementRead}
                className="mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#dfc477] dark:text-[#171914]"
            >
                <Check size={18} />

                {confirmed
                    ? "Agreement Confirmed"
                    : "I Have Read This Agreement"}
            </button>

            {confirmed && (
                <div
                    role="status"
                    className="mt-5 rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                >
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        Confirmation recorded successfully.
                    </p>

                    <a
                        href="/booking"
                        className="mt-3 inline-flex font-extrabold text-[#8d681d] underline underline-offset-4 dark:text-[#e0c373]"
                    >
                        Return to the booking page
                    </a>
                </div>
            )}
        </div>
    );
}