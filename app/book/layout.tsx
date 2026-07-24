import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Book an Event Hall in Ellicott City, MD",

    description:
        "Reserve RoyalwayCC Space in Ellicott City, Maryland. Choose theater seating for up to 100 guests or round-table seating for up to 50 guests.",

    alternates: {
        canonical: "/book",
    },

    openGraph: {
        title: "Book RoyalwayCC Space in Ellicott City",
        description:
            "Check availability, select your preferred layout, and reserve a private event hall in Ellicott City, Maryland.",
        url: "/book",
        type: "website",
    },

    robots: {
        index: true,
        follow: true,
    },
};

export default function BookLayout({
                                       children,
                                   }: {
    children: ReactNode;
}) {
    return children;
}