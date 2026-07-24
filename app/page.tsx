import Hero from "./components/Hero";
import ExperienceStrip from "./components/ExperienceStrip";
import HallLayouts from "./components/HallLayouts";
import FloorPlan from "./components/FloorPlan";
import Amenities from "./components/Amenities";
import PerfectFor from "./components/PerfectFor";
import PricingCalculator from "./components/PricingCalculator";
import Footer from "./components/Footer";
import LocalBusinessJsonLd from "@/app/components/LocalBusinessJsonLd";

const venueSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: "RoyalwayCC Space",
    description:
        "A flexible event hall in Ellicott City, Maryland, available for private events, meetings, celebrations, church events, seminars, and community gatherings.",
    address: {
        "@type": "PostalAddress",
        streetAddress: "3239 Corporate Court",
        addressLocality: "Ellicott City",
        addressRegion: "MD",
        postalCode: "21042",
        addressCountry: "US",
    },
    telephone: "+1-240-879-6435",
    email: "bookings@royalwaycc.org",
    url: "https://royalwaycc.org",
    maximumAttendeeCapacity: 100,
    amenityFeature: [
        {
            "@type": "LocationFeatureSpecification",
            name: "Theater layout",
            value: true,
        },
        {
            "@type": "LocationFeatureSpecification",
            name: "Round-table layout",
            value: true,
        },
        {
            "@type": "LocationFeatureSpecification",
            name: "Outside catering permitted",
            value: true,
        },
        {
            "@type": "LocationFeatureSpecification",
            name: "Alcohol permitted with approval",
            value: true,
        },
    ],
};

export default function Home() {
    return (
        <>
            <LocalBusinessJsonLd />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(venueSchema),
                }}
            />

            <main
                id="top"
                className="
                    min-h-screen
                    overflow-x-hidden
                    bg-[#f8f6f1]
                    text-[#171914]
                    transition-colors
                    duration-500
                    dark:bg-[#0f110e]
                    dark:text-[#f8f4e9]
                "
            >
                <Hero />

                <div className="relative">
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute
                            left-[-12rem]
                            top-[12rem]
                            h-[28rem]
                            w-[28rem]
                            rounded-full
                            bg-[#d8bd72]/10
                            blur-[120px]
                            dark:bg-[#d8bd72]/5
                        "
                    />

                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            absolute
                            right-[-14rem]
                            top-[48rem]
                            h-[30rem]
                            w-[30rem]
                            rounded-full
                            bg-[#6f0f1d]/10
                            blur-[130px]
                            dark:bg-[#8f2637]/10
                        "
                    />

                    <ExperienceStrip />

                    <section
                        id="layouts"
                        className="scroll-mt-24"
                    >
                        <HallLayouts />
                    </section>

                    <FloorPlan />
                    <Amenities />
                    <PerfectFor />

                    <section
                        id="pricing"
                        className="scroll-mt-24"
                    >
                        <PricingCalculator />
                    </section>
                </div>

                <Footer />
            </main>
        </>
    );
}