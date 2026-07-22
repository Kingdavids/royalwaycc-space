import { Armchair, CreditCard, MapPin, Utensils } from "lucide-react";

const items = [
    {
        icon: Armchair,
        title: "100 Chairs",
        text: "Theater setting",
    },
    {
        icon: Utensils,
        title: "50 Guests",
        text: "Round-table setup",
    },
    {
        icon: CreditCard,
        title: "Online Payment",
        text: "Secure checkout",
    },
    {
        icon: MapPin,
        title: "Ellicott City",
        text: "Maryland venue",
    },
];

export default function ExperienceStrip() {
    return (
        <section className="relative z-10 bg-[#141414] px-5 pb-10">
            <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-2xl md:grid-cols-4">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="border-white/10 p-7 md:border-r last:md:border-r-0"
                        >
                            <Icon className="mb-5 text-[#ead9a2]" size={28} />
                            <h3 className="text-2xl font-black tracking-[-0.04em] text-white">
                                {item.title}
                            </h3>
                            <p className="mt-2 font-semibold text-white/50">{item.text}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}