"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

export default function StickyCTA() {
    const [footerVisible, setFooterVisible] = useState(false);

    useEffect(() => {
        const footer = document.getElementById("site-footer");

        if (!footer) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setFooterVisible(entry.isIntersecting);
            },
            {
                threshold: 0,
                rootMargin: "0px 0px 100px 0px",
            }
        );

        observer.observe(footer);

        return () => observer.disconnect();
    }, []);

    return (
        <Link
            href="/book"
            aria-hidden={footerVisible}
            tabIndex={footerVisible ? -1 : 0}
            className={`fixed bottom-5 left-5 right-5 z-50 flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#f0dfaa]/50 bg-gradient-to-r from-[#a97820] via-[#d3ad55] to-[#ead99f] px-7 text-sm font-extrabold text-[#171914] shadow-[0_18px_55px_rgba(142,101,26,.34)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(142,101,26,.42)] md:left-auto md:right-7 ${
                footerVisible
                    ? "pointer-events-none translate-y-24 opacity-0"
                    : "translate-y-0 opacity-100"
            }`}
        >
            <CalendarDays size={18} strokeWidth={1.8} />

            Reserve Your Date

            <ArrowUpRight size={17} strokeWidth={1.9} />
        </Link>
    );
}