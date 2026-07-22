"use client";

import { useState } from "react";
import { Armchair, Circle, MoveRight, UsersRound } from "lucide-react";

const layouts = {
    theater: {
        label: "Theater Setting",
        capacity: "Up to 100 chairs",
        bestFor: "Seminars, church events, trainings, conferences, and presentations.",
    },
    round: {
        label: "Round Table Setting",
        capacity: "Up to 50 guests",
        bestFor: "Birthdays, baby showers, dinners, receptions, and networking events.",
    },
    open: {
        label: "Open Floor",
        capacity: "Flexible use",
        bestFor: "Photoshoots, dance, worship nights, exhibitions, and pop-up events.",
    },
};

export default function FloorPlan() {
    const [active, setActive] = useState<"theater" | "round" | "open">("theater");

    return (
        <section className="bg-[#171717] px-6 py-28 text-white md:px-12 lg:px-20">
            <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#e9d48b]">
                        Visual Layout
                    </p>

                    <h2 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em] md:text-7xl">
                        See how the hall can be arranged.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-white/65">
                        Switch between layout styles to visualize how RoyalwayCC Space can work
                        for your event.
                    </p>

                    <div className="mt-10 grid gap-3">
                        {Object.entries(layouts).map(([key, item]) => (
                            <button
                                key={key}
                                onClick={() => setActive(key as "theater" | "round" | "open")}
                                className={`rounded-3xl border p-5 text-left transition ${
                                    active === key
                                        ? "border-[#e9d48b] bg-[#e9d48b] text-black"
                                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                }`}
                            >
                                <p className="text-xl font-black">{item.label}</p>
                                <p className={active === key ? "text-black/70" : "text-white/55"}>
                                    {item.capacity}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-[38px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl md:p-8">
                    <div className="rounded-[28px] bg-[#f8f1df] p-5 text-[#171717] md:p-8">
                        <div className="rounded-2xl bg-[#171717] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#e9d48b]">
                            Stage / Presentation Area
                        </div>

                        <div className="mt-8 min-h-[360px] rounded-[24px] border-2 border-dashed border-[#c9b27a] bg-white p-6">
                            {active === "theater" && (
                                <div className="grid gap-4">
                                    {Array.from({ length: 8 }).map((_, row) => (
                                        <div key={row} className="flex justify-center gap-3">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <Armchair
                                                    key={i}
                                                    size={22}
                                                    className="text-[#8d6722]"
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {active === "round" && (
                                <div className="grid grid-cols-2 gap-7 md:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex aspect-square items-center justify-center rounded-full border-4 border-[#c89b3c] bg-[#fff8e8]"
                                        >
                                            <UsersRound className="text-[#8d6722]" size={34} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {active === "open" && (
                                <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-gradient-to-br from-[#fff8e8] to-white">
                                    <div className="text-center">
                                        <MoveRight className="mx-auto mb-4 text-[#8d6722]" size={54} />
                                        <p className="text-3xl font-black">Open Flexible Floor</p>
                                        <p className="mt-3 text-[#6d6458]">
                                            Clear layout for movement, creativity, and custom setup.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl bg-white p-5 shadow-lg">
                                <p className="text-xs font-black uppercase tracking-widest text-[#9b7324]">
                                    Layout
                                </p>
                                <p className="mt-2 font-black">{layouts[active].label}</p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-lg">
                                <p className="text-xs font-black uppercase tracking-widest text-[#9b7324]">
                                    Capacity
                                </p>
                                <p className="mt-2 font-black">{layouts[active].capacity}</p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-lg">
                                <p className="text-xs font-black uppercase tracking-widest text-[#9b7324]">
                                    Best For
                                </p>
                                <p className="mt-2 text-sm font-bold text-[#6d6458]">
                                    {layouts[active].bestFor}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}