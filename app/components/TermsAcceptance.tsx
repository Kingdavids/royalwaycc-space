"use client";

import { useEffect, useRef, useState } from "react";
import {
    Check,
    FileText,
    LockKeyhole,
    X,
} from "lucide-react";

type TermsAcceptanceProps = {
    accepted: boolean;
    onAcceptedChange: (accepted: boolean) => void;
    onTermsReadChange: (termsRead: boolean) => void;
};

export default function TermsAcceptance({
                                            accepted,
                                            onAcceptedChange,
                                            onTermsReadChange,
                                        }: TermsAcceptanceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [termsRead, setTermsRead] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onTermsReadChange(termsRead);
    }, [termsRead, onTermsReadChange]);

    function handleTermsScroll() {
        const element = scrollAreaRef.current;

        if (!element || termsRead) {
            return;
        }

        const distanceFromBottom =
            element.scrollHeight -
            element.scrollTop -
            element.clientHeight;

        if (distanceFromBottom <= 12) {
            setTermsRead(true);
        }
    }

    function closeTerms() {
        setIsOpen(false);
    }

    return (
        <>
            <div className="mt-8 rounded-[24px] border border-[#ddd4c3] bg-[#fbf7ed] p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-xl bg-[#a77c25]/10 p-3 text-[#8d681d] dark:bg-[#e0c373]/10 dark:text-[#e0c373]">
                        <FileText size={21} />
                    </div>

                    <div className="flex-1">
                        <p className="font-extrabold text-[#29261f] dark:text-white">
                            RoyalwayCC Space Rental Agreement
                        </p>

                        <p className="mt-2 text-sm leading-7 text-[#625c51] dark:text-white/60">
                            You must open the agreement and scroll to its end
                            before the acceptance checkbox becomes available.
                        </p>

                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#171914] px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                        >
                            {termsRead
                                ? "Review Agreement Again"
                                : "Read Full Agreement"}
                        </button>
                    </div>
                </div>

                <label
                    className={`mt-5 flex items-start gap-4 rounded-[18px] border p-4 ${
                        termsRead
                            ? "cursor-pointer border-[#cdbb8c] bg-white dark:border-[#dfc477]/30 dark:bg-white/[0.03]"
                            : "cursor-not-allowed border-[#e1ddd4] bg-[#f2efe8] opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
                    }`}
                >
                    <input
                        type="checkbox"
                        name="agreementAccepted"
                        checked={accepted}
                        disabled={!termsRead}
                        onChange={(event) =>
                            onAcceptedChange(event.target.checked)
                        }
                        className="mt-1 h-5 w-5 accent-[#a77c25] disabled:cursor-not-allowed"
                    />

                    <span className="text-sm leading-7 text-[#625c51] dark:text-white/65">
                        {termsRead ? (
                            <>
                                I have read and agree to the payment,
                                cancellation, capacity, damage, cleaning,
                                overtime and facility-use terms.
                            </>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <LockKeyhole size={16} />
                                Read the complete agreement to unlock this
                                checkbox.
                            </span>
                        )}
                    </span>
                </label>

                {termsRead && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#7a5b1e] dark:text-[#dfc477]">
                        <Check size={17} />
                        Agreement read to the end.
                    </p>
                )}
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="agreement-title"
                >
                    <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] bg-[#fffdf8] shadow-2xl dark:bg-[#181a16]">
                        <div className="flex items-center justify-between border-b border-black/10 px-5 py-5 dark:border-white/10 md:px-7">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9d7623] dark:text-[#d8bd72]">
                                    Required Review
                                </p>

                                <h2
                                    id="agreement-title"
                                    className="mt-1 text-2xl font-extrabold"
                                >
                                    Space Rental Agreement
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeTerms}
                                aria-label="Close agreement"
                                className="rounded-full border border-black/10 p-3 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div
                            ref={scrollAreaRef}
                            onScroll={handleTermsScroll}
                            className="overflow-y-auto px-5 py-6 text-sm leading-7 text-[#5f594e] dark:text-white/65 md:px-8"
                        >
                            <AgreementContent />

                            <div className="mt-10 rounded-[22px] border border-[#d7c89f] bg-[#f7efd9] p-5 text-[#5b481c] dark:border-[#d8bd72]/25 dark:bg-[#d8bd72]/10 dark:text-[#f0d991]">
                                <p className="font-extrabold">
                                    You have reached the end of the agreement.
                                </p>

                                <p className="mt-2">
                                    The acceptance checkbox on the booking form
                                    is now available.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-black/10 p-5 dark:border-white/10">
                            <button
                                type="button"
                                onClick={closeTerms}
                                disabled={!termsRead}
                                className="flex min-h-14 w-full items-center justify-center rounded-full bg-[#171914] px-6 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#dfc477] dark:text-[#171914]"
                            >
                                {termsRead
                                    ? "I Have Finished Reading"
                                    : "Scroll to the End to Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function AgreementContent() {
    return (
        <article className="space-y-7">
            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    1. Reservation and acceptance
                </h3>

                <p className="mt-2">
                    Submission and payment do not automatically guarantee
                    approval of a reservation. Royalway Christian Centre may
                    review the requested event, date, attendance, activities
                    and facility requirements before final acceptance.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    2. Rental duration
                </h3>

                <p className="mt-2">
                    A minimum booking period of three hours applies. The rental
                    period includes setup, vendor access, decorating, event
                    operation, cleanup and departure. Additional time may
                    result in overtime charges.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    3. Hall arrangement and capacity
                </h3>

                <p className="mt-2">
                    Theater seating accommodates up to 100 guests. Round-table
                    seating accommodates up to 50 guests. The renter must not
                    exceed the capacity associated with the selected setup.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    4. Rental fees
                </h3>

                <p className="mt-2">
                    Theater seating is charged at $105 CAD per hour.
                    Round-table seating is charged at $145 CAD per hour. The
                    amount shown during checkout is based on the setup and
                    duration selected by the renter.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    5. Damage deposit
                </h3>

                <p className="mt-2">
                    A refundable $100 CAD damage deposit is collected with the
                    reservation. Deductions may be made for damage, excessive
                    cleaning, missing property, unauthorized use, overtime or
                    failure to leave the facility in the required condition.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    6. Cancellation
                </h3>

                <p className="mt-2">
                    Cancellation and refund eligibility are governed by the
                    notice requirements communicated by Royalway Christian
                    Centre. Any applicable processing charges or non-refundable
                    expenses may be deducted from a refund.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    7. Food, catering and alcohol
                </h3>

                <p className="mt-2">
                    Outside catering is permitted. Alcohol may be permitted
                    only where disclosed in the booking request and where all
                    applicable laws, licensing requirements, insurance
                    requirements and facility instructions are satisfied.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    8. Facility use and cleanup
                </h3>

                <p className="mt-2">
                    The renter is responsible for guests, vendors, decorations,
                    equipment, waste removal and cleanup. Decorations and
                    equipment must not damage walls, floors, furniture,
                    fixtures or safety systems.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    9. Conduct and prohibited activities
                </h3>

                <p className="mt-2">
                    The facility must be used lawfully and respectfully.
                    Royalway Christian Centre may stop activities that create
                    unsafe conditions, unreasonable disturbance, property
                    damage or a violation of the agreement.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    10. Responsibility
                </h3>

                <p className="mt-2">
                    The renter is responsible for the conduct of attendees,
                    contractors, caterers, decorators and other vendors engaged
                    for the event. The renter agrees to provide accurate
                    booking information and promptly disclose material changes.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    11. Payment authorization
                </h3>

                <p className="mt-2">
                    By proceeding to Stripe Checkout, the renter authorizes
                    collection of the displayed rental charge and damage
                    deposit. Payment is processed securely by Stripe.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-extrabold text-[#24211c] dark:text-white">
                    12. Agreement
                </h3>

                <p className="mt-2">
                    Selecting the agreement checkbox confirms that the renter
                    has reviewed these terms and agrees to comply with them.
                    Electronic acceptance may be recorded with the booking and
                    payment information.
                </p>
            </section>
        </article>
    );
}