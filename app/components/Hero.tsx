import Image from "next/image";
import Link from "next/link";
import {
    ArrowDown,
    ArrowRight,
    CalendarDays,
    MapPin,
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

export default function Hero() {
    return (
        <section
            id="top"
            className="relative overflow-hidden bg-[#141414]"
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="hero-background absolute -inset-4 bg-[linear-gradient(180deg,rgba(20,20,20,.55),rgba(20,20,20,.96)),url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=90')] bg-cover bg-center" />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#c9a227]/20 blur-3xl" />

            <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#234b35]/40 blur-3xl" />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,.28)_100%)]" />

            <nav className="relative z-20 mx-4 mt-5 flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-white/10 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,.18)] backdrop-blur-2xl transition duration-300 hover:border-white/20 hover:bg-white/[0.12] sm:mx-5 sm:px-5 sm:py-4 xl:mx-auto">
                <Link
                    href="/"
                    aria-label="RoyalwayCC Space home"
                    className="flex shrink-0 items-center rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-[#ead9a2]"
                >
                    <Image
                        src="/icon.png"
                        alt="Royalway Christian Centre"
                        width={170}
                        height={58}
                        priority
                        className="h-10 w-auto object-contain sm:h-12"
                    />
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    <a
                        href="#layouts"
                        className="rounded-full font-bold text-white/70 transition duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2]"
                    >
                        Layouts
                    </a>

                    <a
                        href="#pricing"
                        className="rounded-full font-bold text-white/70 transition duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2]"
                    >
                        Pricing
                    </a>

                    <a
                        href="#amenities"
                        className="rounded-full font-bold text-white/70 transition duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2]"
                    >
                        Amenities
                    </a>

                    <ThemeToggle />

                    <Link
                        href="/book"
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#141414] shadow-[0_12px_30px_rgba(0,0,0,.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ead9a2] hover:shadow-[0_16px_38px_rgba(201,162,39,.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                    >
                        Reserve Date

                        <ArrowRight
                            size={17}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />

                    <Link
                        href="/book"
                        aria-label="Reserve RoyalwayCC Space"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#141414] transition duration-300 hover:bg-[#ead9a2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ead9a2]"
                    >
                        <CalendarDays size={16} />
                        Reserve
                    </Link>
                </div>
            </nav>

            <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-5 pb-40 pt-24 text-center">
                <div className="hero-fade hero-delay-one mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-bold text-white/80 backdrop-blur-xl transition duration-300 hover:border-[#ead9a2]/35 hover:bg-white/[0.13]">
                    <MapPin
                        size={16}
                        className="text-[#ead9a2]"
                    />

                    Ellicott City, Maryland
                </div>

                <p className="hero-fade hero-delay-two text-xs font-black uppercase tracking-[0.32em] text-[#ead9a2]">
                    Private Event Venue in Ellicott City
                </p>

                <h1 className="hero-fade hero-delay-three mt-6 max-w-6xl font-[var(--font-display)] text-[4rem] font-bold leading-[0.82] tracking-[-0.06em] text-white sm:text-7xl md:text-9xl lg:text-[10rem]">
                    Elegant Spaces.
                    <br />
                    Exceptional Experiences.
                </h1>

                <p className="hero-fade hero-delay-four mt-8 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                    Book RoyalwayCC Space, a flexible private event hall in
                    Ellicott City, Maryland, for church events, meetings,
                    trainings, birthdays, baby showers, receptions, workshops,
                    and community gatherings.
                </p>

                <div className="hero-fade hero-delay-five mt-10 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row sm:flex-wrap">
                    <Link
                        href="/book"
                        className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#c9a227] to-[#ead9a2] px-8 py-4 font-black text-[#141414] shadow-2xl shadow-[#c9a227]/25 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[#c9a227]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                    >
                        Reserve Your Date

                        <ArrowRight
                            size={19}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>

                    <a
                        href="#layouts"
                        className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        View Hall Layouts

                        <ArrowDown
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-y-1"
                        />
                    </a>
                </div>

                <div className="hero-fade hero-delay-six mt-16 grid w-full max-w-4xl gap-4 md:grid-cols-3">
                    <article className="group rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-[#ead9a2]/30 hover:bg-white/[0.14]">
                        <p className="text-6xl font-black tracking-[-0.08em] text-white transition duration-300 group-hover:text-[#ead9a2]">
                            100
                        </p>

                        <p className="mt-2 font-bold text-white/55 transition duration-300 group-hover:text-white/75">
                            Theater Seating
                        </p>
                    </article>

                    <article className="group rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-[#ead9a2]/30 hover:bg-white/[0.14]">
                        <p className="text-6xl font-black tracking-[-0.08em] text-white transition duration-300 group-hover:text-[#ead9a2]">
                            50
                        </p>

                        <p className="mt-2 font-bold text-white/55 transition duration-300 group-hover:text-white/75">
                            Round Table Setup
                        </p>
                    </article>

                    <article className="group rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-[#ead9a2]/30 hover:bg-white/[0.14]">
                        <p className="text-6xl font-black tracking-[-0.08em] text-white transition duration-300 group-hover:text-[#ead9a2]">
                            1
                        </p>

                        <p className="mt-2 font-bold text-white/55 transition duration-300 group-hover:text-white/75">
                            Private Event Hall
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}