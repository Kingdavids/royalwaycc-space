import {
    Cake,
    Briefcase,
    Church,
    GraduationCap,
    Baby,
    Camera,
    Users,
    HeartHandshake,
} from "lucide-react";

const events = [
    {
        icon: Church,
        title: "Church Events",
        description: "Services, worship nights, conferences, and fellowships.",
    },
    {
        icon: Briefcase,
        title: "Corporate Meetings",
        description: "Trainings, workshops, seminars, and team meetings.",
    },
    {
        icon: Cake,
        title: "Birthday Parties",
        description: "Celebrate birthdays in a clean and elegant venue.",
    },
    {
        icon: Baby,
        title: "Baby Showers",
        description: "Beautiful gatherings for family and friends.",
    },
    {
        icon: GraduationCap,
        title: "Graduations",
        description: "Honor milestones with a memorable celebration.",
    },
    {
        icon: Camera,
        title: "Photoshoots",
        description: "Creative sessions with flexible room layouts.",
    },
    {
        icon: Users,
        title: "Community Events",
        description: "Networking, cultural events, and local programs.",
    },
    {
        icon: HeartHandshake,
        title: "Private Celebrations",
        description: "Family reunions, receptions, and special occasions.",
    },
];

export default function PerfectFor() {
    return (
        <section className="bg-[#171717] py-28">
            <div className="mx-auto max-w-7xl px-6">
                <div className="max-w-3xl">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#d4af37]">
                        Perfect For
                    </p>

                    <h2 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl">
                        Designed for every occasion.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-white/65">
                        Whether you're planning a celebration, business event, or community
                        gathering, RoyalwayCC Space adapts to your needs.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {events.map((event) => {
                        const Icon = event.icon;

                        return (
                            <div
                                key={event.title}
                                className="group rounded-[30px] border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-[#d4af37] hover:bg-white/10"
                            >
                                <Icon
                                    size={42}
                                    className="text-[#d4af37] transition group-hover:scale-110"
                                />

                                <h3 className="mt-8 text-2xl font-black text-white">
                                    {event.title}
                                </h3>

                                <p className="mt-4 leading-7 text-white/60">
                                    {event.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}