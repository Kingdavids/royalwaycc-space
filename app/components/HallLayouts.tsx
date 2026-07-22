import { Presentation, UtensilsCrossed, PartyPopper } from "lucide-react";

const layouts = [
    {
        icon: Presentation,
        title: "Theater Setup",
        capacity: "Up to 100 Chairs",
        description:
            "Perfect for conferences, church services, seminars, graduations, presentations, and community events.",
    },
    {
        icon: UtensilsCrossed,
        title: "Round Table Setup",
        capacity: "Up to 50 Guests",
        description:
            "Ideal for birthdays, baby showers, receptions, banquets, networking dinners, and celebrations.",
    },
    {
        icon: PartyPopper,
        title: "Open Floor",
        capacity: "Flexible Layout",
        description:
            "Great for photoshoots, worship nights, dance rehearsals, exhibitions, fitness classes, and pop-up events.",
    },
];

export default function HallLayouts() {
    return (
        <section
            id="layouts"
            className="bg-[#faf8f3] px-6 py-28 md:px-12 lg:px-20"
        >
            <div className="mx-auto max-w-7xl">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#b8892d]">
                    Flexible Venue
                </p>

                <h2 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-[-0.05em] text-[#171717] md:text-7xl">
                    One Hall. Multiple Possibilities.
                </h2>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                    RoyalwayCC Space transforms to match your event, whether you're hosting
                    a conference, celebration, corporate meeting, or private gathering.
                </p>

                <div className="mt-16 grid gap-8 lg:grid-cols-3">
                    {layouts.map((layout) => {
                        const Icon = layout.icon;

                        return (
                            <div
                                key={layout.title}
                                className="group overflow-hidden rounded-[30px] border border-gray-200 bg-white transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
                            >
                                <div className="flex h-64 items-center justify-center bg-gradient-to-br from-[#efe4c8] via-[#f9f5eb] to-white">
                                    <Icon
                                        className="h-20 w-20 text-[#c89b3c] transition duration-500 group-hover:scale-110"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <div className="p-8">
                                    <p className="text-sm font-black uppercase tracking-widest text-[#b8892d]">
                                        {layout.capacity}
                                    </p>

                                    <h3 className="mt-3 text-3xl font-black tracking-tight">
                                        {layout.title}
                                    </h3>

                                    <p className="mt-5 leading-8 text-gray-600">
                                        {layout.description}
                                    </p>

                                    <button className="mt-8 rounded-full bg-[#171717] px-6 py-3 font-bold text-white transition hover:bg-[#c89b3c] hover:text-black">
                                        Choose this Layout
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}