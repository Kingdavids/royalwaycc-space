import { ArrowRight, MapPin } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#141414]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,.55),rgba(20,20,20,.96)),url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=90')] bg-cover bg-center" />
            <div className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#c9a227]/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#234B35]/40 blur-3xl" />

            <nav className="relative z-20 mx-auto mt-5 flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-2xl">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#ead9a2]">
                        RoyalwayCC
                    </p>
                    <h2 className="text-xl font-black tracking-[-0.05em] text-white">
                        Space
                    </h2>
                </div>

                <div className="hidden items-center gap-8 md:flex">
                    <a href="#layouts" className="font-bold text-white/70 hover:text-white">
                        Layouts
                    </a>
                    <a href="#amenities" className="font-bold text-white/70 hover:text-white">
                        Amenities
                    </a>

                    <ThemeToggle />

                    <a
                        href="#booking"
                        className="rounded-full bg-white px-5 py-3 font-black text-[#141414] transition hover:bg-[#ead9a2]"
                    >
                        Reserve Date
                    </a>
                </div>
            </nav>

            <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-5 pb-40 pt-24 text-center">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-bold text-white/80 backdrop-blur-xl">
                    <MapPin size={16} className="text-[#ead9a2]" />
                    Ellicott City, Maryland
                </div>

                <p className="text-xs font-black uppercase tracking-[0.32em] text-[#ead9a2]">
                    Premium Private Event Hall
                </p>

                <h1 className="mt-6 max-w-6xl font-[var(--font-display)] text-7xl font-bold leading-[0.82] tracking-[-0.06em] text-white md:text-9xl lg:text-[10rem]">
                    Elegant Spaces.
                    <br />
                    Exceptional Experiences.
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70">
                    Reserve RoyalwayCC Space, a flexible private hall for church events,
                    meetings, trainings, birthdays, baby showers, receptions, workshops,
                    and community gatherings.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <a
                        href="#booking"
                        className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#c9a227] to-[#ead9a2] px-8 py-4 font-black text-[#141414] shadow-2xl shadow-[#c9a227]/25 transition hover:-translate-y-1"
                    >
                        Reserve Your Date
                        <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                    </a>

                    <a
                        href="#layouts"
                        className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
                    >
                        View Hall Layouts
                    </a>
                </div>

                <div className="mt-16 grid w-full max-w-4xl gap-4 md:grid-cols-3">
                    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl">
                        <p className="text-6xl font-black tracking-[-0.08em] text-white">100</p>
                        <p className="mt-2 font-bold text-white/55">Theater Seating</p>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl">
                        <p className="text-6xl font-black tracking-[-0.08em] text-white">50</p>
                        <p className="mt-2 font-bold text-white/55">Round Table Setup</p>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur-2xl">
                        <p className="text-6xl font-black tracking-[-0.08em] text-white">1</p>
                        <p className="mt-2 font-bold text-white/55">Private Hall</p>
                    </div>
                </div>
            </div>
        </section>
    );
}