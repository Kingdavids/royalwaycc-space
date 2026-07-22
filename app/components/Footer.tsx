import Link from "next/link";

export default function Footer() {
    return (
        <footer
            id="site-footer"
            className="border-t border-black/10 bg-[#f8f6f1] text-[#171717] dark:border-white/10 dark:bg-[#10120f] dark:text-[#f7f1e5]"
        >
            <div className="mx-auto max-w-6xl px-6 pb-10 pt-14 md:px-8 md:pt-16">

                {/* Top row */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.45fr_1.35fr_.85fr_1fr] md:gap-x-10">

                    {/* Brand */}
                    <div>
                        <Link
                            href="/"
                            className="block text-lg font-light tracking-[-0.025em] transition hover:opacity-60"
                        >
                            Royalway Space
                        </Link>

                        <p className="mt-1 text-xs font-light text-[#8b857b] dark:text-white/40">
                            Presented by Royalway Christian Centre
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <p className="text-[10px] font-light uppercase tracking-[0.12em] text-[#9a9388] dark:text-white/35">
                            Email
                        </p>

                        <a
                            href="mailto:bookings@royalwaycc.org"
                            className="mt-1 block text-sm font-light text-[#686259] transition hover:text-[#a77c25] dark:text-white/55 dark:hover:text-[#d8bd72]"
                        >
                            bookings@royalwaycc.org
                        </a>
                    </div>

                    {/* Phone */}
                    <div>
                        <p className="text-[10px] font-light uppercase tracking-[0.12em] text-[#9a9388] dark:text-white/35">
                            Phone
                        </p>

                        <a
                            href="tel:+12408796435"
                            className="mt-1 block text-sm font-light text-[#686259] transition hover:text-[#a77c25] dark:text-white/55 dark:hover:text-[#d8bd72]"
                        >
                            240-879-6435
                        </a>
                    </div>

                    {/* Location */}
                    <div>
                        <p className="text-[10px] font-light uppercase tracking-[0.12em] text-[#9a9388] dark:text-white/35">
                            Location
                        </p>

                        <a
                            href="https://www.google.com/maps/search/?api=1&query=3239+Corporate+Court+Ellicott+City+MD+21042"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-light text-[#686259] transition hover:text-[#a77c25] dark:text-white/55 dark:hover:text-[#d8bd72]"
                        >
                            3239 Corporate Court, Ellicott City, MD 21042
                        </a>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="mt-10 flex flex-col gap-4 border-t border-black/10 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs font-light text-[#918b81] dark:text-white/30">
                        © {new Date().getFullYear()} Royalway Space. All rights reserved.
                    </p>

                    <nav className="flex items-center gap-6 text-xs font-light text-[#918b81] dark:text-white/30">
                        <Link
                            href="/agreement"
                            className="transition hover:text-[#171717] dark:hover:text-white"
                        >
                            Agreement
                        </Link>

                        <Link
                            href="/#pricing"
                            className="transition hover:text-[#171717] dark:hover:text-white"
                        >
                            Pricing
                        </Link>

                        <Link
                            href="/book"
                            className="transition hover:text-[#171717] dark:hover:text-white"
                        >
                            Book
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}