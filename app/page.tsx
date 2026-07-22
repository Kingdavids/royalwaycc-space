import Hero from "./components/Hero";
import ExperienceStrip from "./components/ExperienceStrip";
import HallLayouts from "./components/HallLayouts";
import FloorPlan from "./components/FloorPlan";
import Amenities from "./components/Amenities";
import PerfectFor from "./components/PerfectFor";
import PricingCalculator from "./components/PricingCalculator";
import Footer from "./components/Footer";
import StickyCTA from "./components/StickyCTA";

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
};

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(venueSchema),
                }}
            />

            <main className="min-h-screen overflow-hidden bg-[#f8f6f1] text-[#141414]">
                <Hero />
                <ExperienceStrip />
                <HallLayouts />
                <FloorPlan />
                <Amenities />
                <PerfectFor />
                <PricingCalculator />
                <Footer />
                <StickyCTA />
            </main>
        </>
    );
}