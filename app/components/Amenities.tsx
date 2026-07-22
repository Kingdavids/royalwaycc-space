import {
    Car,
    Wifi,
    Accessibility,
    Snowflake,
    Sparkles,
    ShieldCheck,
    Clock3,
} from "lucide-react";

const amenities = [
    {
        icon: Car,
        title: "Free Parking",
        description: "Convenient on-site parking for your guests.",
    },
    {
        icon: Wifi,
        title: "High-Speed WiFi",
        description: "Reliable internet for meetings and livestreams.",
    },
    {
        icon: Snowflake,
        title: "Climate Controlled",
        description: "Comfortable throughout every season.",
    },
    {
        icon: Accessibility,
        title: "Accessible Facility",
        description: "Designed to accommodate all guests.",
    },
    {
        icon: Sparkles,
        title: "Clean Venue",
        description: "Professionally maintained before every event.",
    },
    {
        icon: ShieldCheck,
        title: "Safe Environment",
        description: "Well-maintained, welcoming, and secure.",
    },
    {
        icon: Clock3,
        title: "Flexible Booking",
        description: "Reserve the hall for the schedule that fits your event.",
    },
];

export default function Amenities() {
    return (
        <section
            id="amenities"
            className="bg-[#faf8f3] px-6 py-28 md:px-12 lg:px-20"
        >
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8892d]">
                        Amenities
                    </p>

                    <h2 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em] text-[#171717] md:text-7xl">
                        Everything you need for a successful event.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Every booking includes access to a clean, flexible venue designed to
                        help your event run smoothly from start to finish.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {amenities.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="group rounded-[30px] border border-gray-200 bg-white p-8 transition duration-500 hover:-translate-y-2 hover:border-[#c89b3c] hover:shadow-2xl"
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6eed8] transition group-hover:bg-[#c89b3c]">
                                    <Icon
                                        className="text-[#b8892d] group-hover:text-white"
                                        size={30}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <h3 className="mt-8 text-2xl font-black">
                                    {item.title}
                                </h3>

                                <p className="mt-4 leading-7 text-gray-600">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}