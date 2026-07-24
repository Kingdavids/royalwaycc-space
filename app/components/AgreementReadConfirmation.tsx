"use client";

import {
    Check,
    ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AGREEMENT_STORAGE_KEY =
    "royalwaycc-space-agreement-read-v2";

export default function AgreementReadConfirmation() {
    const sectionRef = useRef<HTMLDivElement>(null);

    const [reachedEnd, setReachedEnd] =
        useState(false);

    const [confirmed, setConfirmed] =
        useState(false);

    useEffect(() => {
        /*
         * Every visit to the agreement must begin as
         * unconfirmed. Remove any unused old token.
         */
        window.localStorage.removeItem(
            AGREEMENT_STORAGE_KEY
        );

        function checkPagePosition() {
            const section = sectionRef.current;

            if (!section) {
                return;
            }

            const sectionTop =
                section.getBoundingClientRect().top;

            const viewportHeight =
                window.innerHeight;

            if (sectionTop <= viewportHeight - 80) {
                setReachedEnd(true);
            }
        }

        checkPagePosition();

        window.addEventListener(
            "scroll",
            checkPagePosition,
            {
                passive: true,
            }
        );

        window.addEventListener(
            "resize",
            checkPagePosition
        );

        return () => {
            window.removeEventListener(
                "scroll",
                checkPagePosition
            );

            window.removeEventListener(
                "resize",
                checkPagePosition
            );
        };
    }, []);

    function confirmAgreementRead() {
        if (!reachedEnd || confirmed) {
            return;
        }

        /*
         * Store the confirmation time rather than
         * permanently storing "true".
         */
        window.localStorage.setItem(
            AGREEMENT_STORAGE_KEY,
            Date.now().toString()
        );

        setConfirmed(true);
    }

    return (
        <div
            ref={sectionRef}
            className="mt-10 rounded-[28px] border border-[#d8c99f] bg-[#fffaf0] p-6 shadow-[0_20px_55px_rgba(81,61,18,.08)] dark:border-[#d8bd72]/25 dark:bg-[#1b1d18] md:p-8"
        >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9d7623] dark:text-[#d8bd72]">
                Final acknowledgement
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                Confirm that you reached the end of
                the agreement.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d665a] dark:text-white/60">
                After reading the complete rental
                agreement, confirm below and return
                to the booking page. The agreement
                checkbox will then be unlocked for
                this reservation.
            </p>

            <button
                type="button"
                disabled={!reachedEnd || confirmed}
                onClick={confirmAgreementRead}
                className="mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 dark:bg-[#dfc477] dark:text-[#171914]"
            >
                {confirmed ? (
                    <>
                        <Check size={18} />
                        Agreement Confirmed
                    </>
                ) : reachedEnd ? (
                    <>
                        <Check size={18} />
                        I Have Read This Agreement
                    </>
                ) : (
                    <>
                        <ChevronDown size={18} />
                        Continue Reading
                    </>
                )}
            </button>

            {confirmed && (
                <p
                    role="status"
                    className="mt-4 text-sm font-bold text-emerald-700 dark:text-emerald-300"
                >
                    Confirmation recorded. Return to
                    the booking page and manually
                    select the agreement checkbox.
                </p>
            )}
        </div>
    );
}