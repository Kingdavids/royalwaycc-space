import type { Metadata } from "next";
import {
    Bricolage_Grotesque,
    Manrope,
} from "next/font/google";
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
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://royalwaycc.org";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),

    title: {
        default:
            "Royalway Space | Event Hall Rental in Ellicott City, MD",
        template: "%s | Royalway Space",
    },

    description:
        "Reserve Royalway Space at 3239 Corporate Court in Ellicott City, Maryland. A flexible private event hall for church events, birthdays, baby showers, meetings, seminars, receptions, and community gatherings.",

    applicationName: "Royalway Space",

    keywords: [
        "event hall Ellicott City",
        "event space Ellicott City MD",
        "hall rental Ellicott City",
        "venue rental Howard County",
        "party venue Ellicott City",
        "baby shower venue Ellicott City",
        "birthday party venue Maryland",
        "meeting space Ellicott City",
        "church event venue Maryland",
        "seminar venue Howard County",
        "private event hall near Columbia MD",
        "Royalway Space",
        "RoyalwayCC Space",
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

    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "Royalway Space",

        title:
            "Royalway Space | Event Hall Rental in Ellicott City, MD",

        description:
            "A flexible private event hall in Ellicott City for celebrations, meetings, church events, seminars, receptions, and community gatherings.",

        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Royalway Space event hall in Ellicott City, Maryland",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",

        title:
            "Royalway Space | Event Hall Rental in Ellicott City, MD",

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

    other: {
        "geo.region": "US-MD",
        "geo.placename": "Ellicott City",
        "geo.position": "39.2673;-76.7983",
        ICBM: "39.2673, -76.7983",
        telephone: "+1-240-879-6435",
        email: "bookings@royalwaycc.org",
    },
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
        <body>{children}</body>
        </html>
    );
}