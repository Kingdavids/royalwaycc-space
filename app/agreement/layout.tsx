import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Space Rental Agreement",

    description:
        "Review the RoyalwayCC Space rental agreement, including reservation, payment, cancellation, capacity, cleaning, alcohol, catering and facility-use terms.",

    alternates: {
        canonical: "/agreement",
    },
};

export default function AgreementLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    return children;
}