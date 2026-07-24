import {
    getAbsoluteUrl,
    siteConfig,
} from "../lib/site";

export default function LocalBusinessJsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": [
            "LocalBusiness",
            "EventVenue",
        ],
        "@id": `${getAbsoluteUrl("/")}#venue`,
        name: siteConfig.name,
        description: siteConfig.description,
        url: getAbsoluteUrl("/"),
        logo: getAbsoluteUrl(siteConfig.logo),
        image: siteConfig.heroImage,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        priceRange: "$$",

        address: {
            "@type": "PostalAddress",
            streetAddress:
            siteConfig.address.streetAddress,
            addressLocality:
            siteConfig.address.addressLocality,
            addressRegion:
            siteConfig.address.addressRegion,
            postalCode:
            siteConfig.address.postalCode,
            addressCountry:
            siteConfig.address.addressCountry,
        },

        amenityFeature: [
            {
                "@type": "LocationFeatureSpecification",
                name: "Theater seating",
                value: true,
            },
            {
                "@type": "LocationFeatureSpecification",
                name: "Round-table setup",
                value: true,
            },
            {
                "@type": "LocationFeatureSpecification",
                name: "Outside catering permitted",
                value: true,
            },
            {
                "@type": "LocationFeatureSpecification",
                name: "Alcohol permitted subject to requirements",
                value: true,
            },
        ],

        maximumAttendeeCapacity: 100,

        makesOffer: [
            {
                "@type": "Offer",
                name: "Theater Setting",
                price: "105",
                priceCurrency: "USD",
                description:
                    "Theater-style event hall rental for up to 100 guests with a three-hour minimum.",
                url: getAbsoluteUrl(
                    "/book?layout=theater&hours=3"
                ),
            },
            {
                "@type": "Offer",
                name: "Round-Table Setting",
                price: "145",
                priceCurrency: "USD",
                description:
                    "Round-table event hall rental for up to 50 guests with a three-hour minimum.",
                url: getAbsoluteUrl(
                    "/book?layout=round-table&hours=3"
                ),
            },
        ],

        potentialAction: {
            "@type": "ReserveAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: getAbsoluteUrl("/book"),
                actionPlatform: [
                    "https://schema.org/DesktopWebPlatform",
                    "https://schema.org/MobileWebPlatform",
                ],
            },
            result: {
                "@type": "Reservation",
                name: "Event hall reservation",
            },
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                    structuredData
                ).replace(/</g, "\\u003c"),
            }}
        />
    );
}