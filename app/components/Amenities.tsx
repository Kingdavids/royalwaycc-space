import Link from "next/link";
import {
    Accessibility,
    ArrowRight,
    Car,
    Clock3,
    ShieldCheck,
    Snowflake,
    Sparkles,
    Wifi,
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
            className="relative scroll-mt-24 overflow-hidden bg-[#faf8f3] px-6 py-28 transition-colors duration-500 dark:bg-[#11130f] md:px-12 lg:px-20"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-12rem] top-20 h-[30rem] w-[30rem] rounded-full bg-[#c89b3c]/10 blur-[120px] dark:bg-[#c89b3c]/5"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-12rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-[#234b35]/10 blur-[130px] dark:bg-[#234b35]/15"
            />

            <div
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-px w-[80%] max-w-5xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c89b3c]/45 to-transparent"
            />

            <div className="relative mx-auto max-w-7xl">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-3 rounded-full border border-[#c89b3c]/20 bg-[#c89b3c]/[0.07] px-4 py-2 dark:border-[#ead9a2]/15 dark:bg-[#ead9a2]/5">
                        <span className="h-2 w-2 rounded-full bg-[#c89b3c]" />

                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#a97922] dark:text-[#ead9a2]">
                            Amenities
                        </p>
                    </div>

                    <h2 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[#171717] dark:text-[#f7f2e7] md:text-7xl">
                        Everything you need for a successful event.
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#64645f] dark:text-white/60">
                        Every booking includes access to a clean, flexible venue
                        designed to help your event run smoothly from start to
                        finish.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {amenities.map((item, index) => {
                        const Icon = item.icon;
                        const isLastItem = index === amenities.length - 1;

                        return (
                            <article
                                key={item.title}
                                className={`amenity-card group relative overflow-hidden rounded-[30px] border border-[#dedbd2] bg-white p-8 text-center shadow-[0_12px_40px_rgba(30,28,20,0.04)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:border-[#c89b3c]/70 hover:shadow-[0_28px_70px_rgba(77,57,18,0.14)] dark:border-white/10 dark:bg-[#191b16] dark:shadow-[0_18px_50px_rgba(0,0,0,0.2)] dark:hover:border-[#ead9a2]/35 ${
                                    isLastItem ? "lg:col-start-2" : ""
                                }`}
                                style={{
                                    animationDelay: `${index * 80}ms`,
                                }}
                            >
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#c89b3c]/0 blur-3xl transition duration-500 group-hover:bg-[#c89b3c]/15"
                                />

                                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c89b3c]/15 bg-gradient-to-br from-[#fff9e9] to-[#f1e3bc] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 group-hover:border-[#c89b3c] group-hover:from-[#c89b3c] group-hover:to-[#e1bd67] dark:border-[#ead9a2]/10 dark:from-[#29291f] dark:to-[#1f211a] dark:shadow-none dark:group-hover:from-[#b8892d] dark:group-hover:to-[#d8b65e]">
                                    <Icon
                                        className="text-[#a97922] transition-all duration-500 group-hover:scale-105 group-hover:text-white dark:text-[#ead9a2]"
                                        size={30}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <h3 className="relative mt-8 text-2xl font-black leading-tight tracking-[-0.035em] text-[#1c1c1a] transition-colors duration-300 group-hover:text-[#a97922] dark:text-[#f7f2e7] dark:group-hover:text-[#ead9a2]">
                                    {item.title}
                                </h3>

                                <p className="relative mt-4 leading-7 text-[#666660] dark:text-white/55">
                                    {item.description}
                                </p>

                                <div
                                    aria-hidden="true"
                                    className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#b8892d] to-[#ead9a2] transition-all duration-500 group-hover:w-[calc(100%-4rem)]"
                                />
                            </article>
                        );
                    })}
                </div>

                <div className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-[#d8d2c3]/40 bg-gradient-to-br from-[#171914] via-[#142018] to-[#10110e] px-7 py-14 text-center shadow-[0_30px_90px_rgba(20,20,15,0.22)] sm:px-10 sm:py-16 lg:px-14">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c89b3c]/20 blur-[110px]"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-32 left-[10%] h-72 w-72 rounded-full bg-[#234b35]/35 blur-[100px]"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#6f0f1d]/20 blur-[100px]"
                    />

                    <div
                        aria-hidden="true"
                        className="plan-shimmer pointer-events-none absolute inset-y-0 left-[-40%] w-[35%] -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
                    />

                    <div className="relative z-10 mx-auto max-w-4xl">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ead9a2]">
                            Plan Your Event
                        </p>

                        <Link
                            href="/book"
                            className="group mx-auto mt-5 inline-flex max-w-full items-center justify-center gap-3 rounded-2xl px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2] focus-visible:ring-offset-4 focus-visible:ring-offset-[#171914]"
                        >
                            <h3 className="plan-heading text-3xl font-black leading-tight tracking-[-0.05em] text-white transition duration-300 group-hover:text-[#ead9a2] sm:text-5xl lg:text-6xl">
                                Ready to reserve RoyalwayCC Space?
                            </h3>

                            <ArrowRight
                                size={34}
                                strokeWidth={2}
                                className="hidden shrink-0 text-[#ead9a2] transition-transform duration-300 group-hover:translate-x-3 sm:block"
                            />
                        </Link>

                        <div className="mx-auto mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#ead9a2] to-transparent transition-all duration-500 group-hover:w-28" />

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                            Select your preferred date, event layout, booking
                            duration, and complete your reservation in a few
                            simple steps.
                        </p>

                        <Link
                            href="/book"
                            aria-label="Open the RoyalwayCC Space booking page"
                            className="group mt-8 inline-flex items-center gap-2 rounded-full text-sm font-black uppercase tracking-[0.18em] text-[#ead9a2] transition duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2]"
                        >
                            Start your reservation

                            <ArrowRight
                                size={17}
                                className="transition-transform duration-300 group-hover:translate-x-2"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}