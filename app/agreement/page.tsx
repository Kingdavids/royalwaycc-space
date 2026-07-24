"use client";

import {
    ArrowLeft,
    Check,
    FileSignature,
    ShieldCheck,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";

const AGREEMENT_STORAGE_KEY =
    "royalwaycc-space-agreement-read-v2";

const AGREEMENT_CONFIRMATION_LIMIT_MS =
    30 * 60 * 1000;

const sections = [
    {
        title: "1. Parties and reservation",
        content:
            "This Space Rental Agreement is between Royalway Christian Centre, operating RoyalwayCC Space, and the person or organization identified as the renter during booking. The reservation applies only to the event date, times, hall arrangement, guest count, and purpose stated in the confirmed booking.",
    },
    {
        title: "2. Rental period",
        content:
            "The minimum rental period is three hours. The reserved period must include setup, decorating, vendor arrival, the event itself, cleanup, and removal of all belongings. Access before the confirmed start time or occupancy after the confirmed end time may result in additional charges.",
    },
    {
        title: "3. Rental rates",
        content:
            "The theater arrangement is billed at $105 per hour and accommodates up to 100 chairs. The round-table arrangement is billed at $145 per hour and accommodates up to 50 guests. Pricing is based on the arrangement and duration selected during checkout.",
    },
    {
        title: "4. Damage and security deposit",
        content:
            "A $100 refundable security deposit is collected with every reservation. RoyalwayCC Space will inspect the facility after the event and, where no deductions are required, initiate the return of the deposit within 48 hours after the reservation ends. Reasonable deductions may be made for damage, missing property, excessive cleaning, unauthorized use, overtime, policy violations, or other costs caused by the renter, guests, caterers, vendors, contractors, or invitees. RoyalwayCC Space will provide the renter with a written explanation of any deduction. The renter remains responsible for costs that exceed the security deposit.",
    },
    {
        title: "5. Payment and confirmation",
        content:
            "A date is not reserved merely because a booking form was submitted. The reservation becomes confirmed only after the required payment is successfully completed and RoyalwayCC Space issues confirmation. Failed, reversed, disputed, or incomplete payments may result in cancellation.",
    },
    {
        title: "6. Event details and permitted use",
        content:
            "The renter must provide accurate information about the event, attendance, activities, vendors, decorations, catering, entertainment, and equipment. The space may not be used for unlawful, unsafe, misleading, or undisclosed purposes. RoyalwayCC Space may refuse or end an event that materially differs from the approved use.",
    },
    {
        title: "7. Capacity and supervision",
        content:
            "Occupancy must not exceed 100 chairs in theater arrangement or 50 guests in round-table arrangement. The renter is responsible for supervising guests, children, vendors, entertainers, and contractors and for ensuring compliance with facility instructions and applicable safety requirements.",
    },
    {
        title: "8. Decorations and alterations",
        content:
            "Decorations must not damage walls, floors, ceilings, furnishings, doors, fixtures, or equipment. Nails, screws, staples, permanent adhesives, open flames, glitter, confetti, smoke-producing devices, and similar materials may not be used unless specifically approved in writing. All approved decorations must be removed before the rental period ends.",
    },
    {
        title: "9. Outside catering",
        content:
            "Outside catering is permitted. The renter is responsible for selecting qualified caterers and ensuring that all caterers, food vendors, and service providers comply with applicable health, safety, licensing, insurance, and facility requirements. Caterers must remain within approved preparation and service areas. Cooking methods, warming equipment, open flames, fuel-powered appliances, and on-site food preparation require prior written approval. The renter is responsible for spills, stains, grease, waste, vendor conduct, and cleanup resulting from food or beverage service.",
    },
    {
        title: "10. Alcohol service",
        content:
            "Alcohol is permitted only with prior disclosure and approval by RoyalwayCC Space. The renter is responsible for obtaining every license, permit, authorization, and insurance policy required for the possession, sale, service, or consumption of alcohol. Where required, alcohol must be supplied and served by a properly licensed and insured caterer or bartender. Alcohol may not be sold, included in admission, or otherwise distributed in a manner requiring a license unless the appropriate license has been obtained. Alcohol may not be served to anyone under the legal drinking age or to an intoxicated person. The renter must provide responsible supervision and arrange safe transportation where appropriate. RoyalwayCC Space may stop alcohol service or end the event if these requirements are violated.",
    },
    {
        title: "11. Cleaning and condition",
        content:
            "The renter must leave the facility in substantially the same condition in which it was provided. All personal property, decorations, catering materials, food, beverages, supplies, and waste must be removed or placed in designated areas before the rental period ends. Spills must be addressed promptly. Excessive cleaning, stain removal, waste removal, restoration, or failure to follow checkout instructions may be charged against the security deposit or billed separately.",
    },
    {
        title: "12. Conduct and safety",
        content:
            "The renter must maintain orderly and respectful conduct. Entrances, exits, hallways, and safety equipment must remain unobstructed. RoyalwayCC Space may stop conduct that creates a safety risk, causes unreasonable disturbance, damages property, violates law, or interferes with facility operations.",
    },
    {
        title: "13. Conduct, alcohol safety, and facility rules",
        content:
            "The renter must maintain orderly, lawful, and respectful conduct throughout the reservation. Entrances, exits, hallways, safety equipment, and emergency access points must remain unobstructed. Smoking, illegal drugs, weapons, disorderly conduct, unsafe alcohol consumption, and activities that create an unreasonable risk are prohibited. RoyalwayCC Space may stop alcohol service, remove individuals, contact authorities, or end an event when reasonably necessary to protect people, property, or facility operations.",
    },
    {
        title: "14. Cancellation and rescheduling",
        content:
            "Cancellation and rescheduling eligibility, deadlines, credits, and refunds will be governed by the policy displayed during checkout and included in the reservation confirmation. The refundable damage deposit is separate from the rental cancellation policy. Unless deductions are justified under this agreement, the deposit will be initiated for return within 48 hours after the event rather than being retained as a cancellation charge.",
    },
    {
        title: "15. Indemnity and liability",
        content:
            "To the extent permitted by law, the renter is responsible for claims, losses, costs, or damage arising from the renter's event, guests, vendors, contractors, activities, or breach of this agreement. Nothing in this agreement excludes liability that cannot legally be excluded.",
    },
    {
        title: "16. Electronic acceptance",
        content:
            "Selecting the agreement checkbox, entering identifying information, and completing payment constitutes the renter's electronic acceptance of this agreement. The renter confirms that they have authority to enter the agreement personally or on behalf of the identified organization.",
    },
    {
        title: "17. Governing law",
        content:
            "This agreement is governed by the laws of the State of Maryland. Any provision found unenforceable will be limited or removed only to the extent necessary, while the remaining provisions continue in effect.",
    },
];

export default function AgreementPage() {
    const router = useRouter();
    const [agreementRead, setAgreementRead] =
        useState(false);

    useEffect(() => {
        const storedConfirmation =
            window.localStorage.getItem(
                AGREEMENT_STORAGE_KEY
            );

        if (!storedConfirmation) {
            return;
        }

        const confirmationTime =
            Number(storedConfirmation);

        const confirmationIsValid =
            Number.isFinite(confirmationTime) &&
            Date.now() - confirmationTime <=
            AGREEMENT_CONFIRMATION_LIMIT_MS;

        if (confirmationIsValid) {
            setAgreementRead(true);
        } else {
            window.localStorage.removeItem(
                AGREEMENT_STORAGE_KEY
            );
        }
    }, []);

    function confirmAgreementRead() {
        const confirmationTime =
            Date.now().toString();

        window.localStorage.setItem(
            AGREEMENT_STORAGE_KEY,
            confirmationTime
        );

        setAgreementRead(true);

        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
                {
                    type:
                        "ROYALWAY_AGREEMENT_CONFIRMED",
                    confirmationTime,
                },
                window.location.origin
            );
        }
    }

    function returnToBooking() {
        if (!agreementRead) {
            return;
        }

        if (window.opener && !window.opener.closed) {
            window.opener.focus();
            window.close();
            return;
        }

        router.push("/book");
    }

    return (
        <main className="min-h-screen bg-[#f7f4ed] px-5 py-8 text-[#171717] dark:bg-[#10120f] dark:text-[#f7f1e5] md:px-8 md:py-14">
            <article className="mx-auto max-w-4xl">
                <button
                    type="button"
                    onClick={() => router.push("/book")}
                    className="inline-flex items-center gap-2 font-bold text-[#6f675a] transition hover:text-[#a77c25] dark:text-white/60"
                >
                    <ArrowLeft size={18} />
                    Return to booking
                </button>

                <header className="mt-9 rounded-[38px] bg-[#171914] p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,.14)] md:p-12">
                    <FileSignature
                        className="text-[#d8bd72]"
                        size={38}
                    />
                    <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.28em] text-[#d8bd72]">
                        RoyalwayCC Space
                    </p>
                    <h1 className="mt-4 text-5xl font-bold leading-[0.94] tracking-[-0.05em] md:text-7xl">
                        Space Rental Agreement
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                        Please read these terms carefully
                        before submitting a reservation
                        and completing payment.
                    </p>
                </header>

                <div className="mt-8 rounded-[34px] border border-[#d8bd72]/50 bg-[#fff8e5] p-6 text-[#5f4b1f] dark:border-[#d8bd72]/25 dark:bg-[#2a271c] dark:text-[#eadba7]">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="mt-1 shrink-0" />
                        <div>
                            <p className="font-extrabold">
                                Important review notice
                            </p>
                            <p className="mt-2 leading-7">
                                Review the complete agreement,
                                then confirm your review at the
                                bottom of this page.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-5">
                    {sections.map((section) => (
                        <section
                            key={section.title}
                            className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_16px_50px_rgba(0,0,0,.045)] dark:border-white/10 dark:bg-[#191b17] md:p-8"
                        >
                            <h2 className="text-2xl font-bold tracking-[-0.035em]">
                                {section.title}
                            </h2>
                            <p className="mt-4 leading-8 text-[#676055] dark:text-white/60">
                                {section.content}
                            </p>
                        </section>
                    ))}
                </div>

                <div className="mt-9 rounded-[30px] bg-[#e9ddbb] p-6 text-[#41371f] dark:bg-[#29261c] dark:text-[#eee0b4] md:p-8">
                    <p className="font-extrabold">
                        Agreement record
                    </p>
                    <p className="mt-3 leading-7">
                        Upon successful booking, the system
                        will record the agreement version,
                        customer details, acceptance date and
                        time, reservation details, and payment
                        reference.
                    </p>
                </div>

                <div className="mt-8 rounded-[32px] border border-[#d5c184] bg-[#fff9e8] p-7 shadow-[0_24px_70px_rgba(88,68,22,.1)] dark:border-[#d8bd72]/30 dark:bg-[#1b1d18] md:p-9">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#171914] text-[#d8bd72] dark:bg-[#d8bd72] dark:text-[#171914]">
                            <Check size={22} />
                        </span>
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9d7623] dark:text-[#d8bd72]">
                                Terms acceptance
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                                Confirm your review
                            </h2>
                            <p className="mt-3 leading-7 text-[#676055] dark:text-white/60">
                                Confirming does not reload or
                                leave this page. It reveals the
                                button that returns you to your
                                filled booking form.
                            </p>
                        </div>
                    </div>

                    {!agreementRead ? (
                        <button
                            type="button"
                            onClick={confirmAgreementRead}
                            className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                        >
                            <Check size={18} />
                            I Have Read This Agreement
                        </button>
                    ) : (
                        <>
                            <p className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                <Check size={16} />
                                Agreement review recorded successfully.
                            </p>

                            <button
                                type="button"
                                onClick={returnToBooking}
                                className="mt-5 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-0.5 dark:bg-[#dfc477] dark:text-[#171914]"
                            >
                                <ArrowLeft size={18} />
                                Back to Booking
                            </button>
                        </>
                    )}
                </div>
            </article>
        </main>
    );
}