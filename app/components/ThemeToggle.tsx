"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
    const { theme, mounted, toggleTheme } = useTheme();
    const dark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            disabled={!mounted}
            aria-label={
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            aria-pressed={dark}
            className="
                group
                flex
                h-12
                items-center
                gap-2
                rounded-full
                border
                border-stone-300/70
                bg-white/85
                px-3
                text-stone-900
                shadow-[0_14px_40px_rgba(39,30,14,0.14)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#c7a95d]
                hover:bg-[#fffaf0]
                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-white/15
                dark:bg-white/10
                dark:text-white
                dark:shadow-[0_16px_44px_rgba(0,0,0,0.35)]
                dark:hover:border-[#d8bd72]/50
                dark:hover:bg-white/15
            "
        >
            <span
                className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    duration-300
                    ${
                    dark
                        ? "rotate-0 bg-[#ead9a2] text-[#141414]"
                        : "rotate-0 bg-[#171914] text-[#f7f1e5]"
                }
                `}
            >
                {mounted ? (
                    dark ? (
                        <Moon size={16} />
                    ) : (
                        <Sun size={16} />
                    )
                ) : (
                    <span className="h-4 w-4 rounded-full bg-current/20" />
                )}
            </span>

            <span className="hidden pr-2 text-sm font-black md:block">
                {mounted
                    ? dark
                        ? "Dark"
                        : "Light"
                    : "Theme"}
            </span>
        </button>
    );
}