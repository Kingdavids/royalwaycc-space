import type { Metadata } from "next";
import {
    Bricolage_Grotesque,
    Manrope,
} from "next/font/google";

import ThemeProvider from "@/app/components/ThemeProvider";
import ThemeScript from "@/app/components/ThemeScript";

import "./globals.css";

const heading = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
});

const body = Manrope({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://royalwaycc.org";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),

    title: {
        default:
            "RoyalwayCC Space | Event Hall Rental in Ellicott City, MD",
        template: "%s | RoyalwayCC Space",
    },

    description:
        "Reserve RoyalwayCC Space at 3239 Corporate Court in Ellicott City, Maryland. A flexible private event hall for church events, birthdays, baby showers, meetings, seminars, receptions, workshops, and community gatherings.",

    applicationName: "RoyalwayCC Space",

    keywords: [
        "event hall Ellicott City",
        "event venue Ellicott City MD",
        "event space Ellicott City MD",
        "hall rental Ellicott City",
        "venue rental Howard County",
        "party venue Ellicott City",
        "baby shower venue Ellicott City",
        "birthday party venue Maryland",
        "meeting space Ellicott City",
        "church event venue Maryland",
        "seminar venue Howard County",
        "reception hall Ellicott City",
        "private event hall near Columbia MD",
        "community event space Maryland",
        "RoyalwayCC Space",
        "Royalway Space",
    ],

    authors: [
        {
            name: "Royalway Christian Centre",
        },
    ],

    creator: "Royalway Christian Centre",
    publisher: "Royalway Christian Centre",

    alternates: {
        canonical: "/",
    },

    icons: {
        icon: [
            {
                url: "/icon.png",
                type: "/icon.png",
            },
        ],
        shortcut: "/icon.png",
        apple: [
            {
                url: "/icon.png",
                type: "/icon.png",
            },
        ],
    },

    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "RoyalwayCC Space",

        title:
            "RoyalwayCC Space | Event Hall Rental in Ellicott City, MD",

        description:
            "Reserve a flexible private event hall in Ellicott City for celebrations, meetings, church events, seminars, receptions, workshops, and community gatherings.",

        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "RoyalwayCC Space event hall in Ellicott City, Maryland",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",

        title:
            "RoyalwayCC Space | Event Hall Rental in Ellicott City, MD",

        description:
            "Reserve a flexible private event hall in Ellicott City, Maryland.",

        images: ["/og-image.jpg"],
    },

    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    category: "Event Venue",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${heading.variable} ${body.variable}`}
            suppressHydrationWarning
        >
        <head>
            <ThemeScript />
        </head>

        <body className="font-sans antialiased">
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}