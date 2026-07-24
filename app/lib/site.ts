const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
    name: "RoyalwayCC Space",
    shortName: "RoyalwayCC Space",

    description:
        "Book RoyalwayCC Space, a private event hall in Ellicott City, Maryland, for church events, meetings, trainings, birthdays, baby showers, receptions, workshops, and community gatherings.",

    url:
        configuredSiteUrl ||
        "http://localhost:3000",

    address: {
        streetAddress: "3239 Corporate Court",
        addressLocality: "Ellicott City",
        addressRegion: "MD",
        postalCode: "21042",
        addressCountry: "US",
    },

    phone: "+1-240-879-6435",
    email: "bookings@royalwaycc.org",

    logo: "/images/logo.png",
    heroImage:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=90",
};

export function getAbsoluteUrl(path = "/"): string {
    return new URL(path, siteConfig.url).toString();
}