"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);

    return (
        <button
            type="button"
            onClick={() => setDark(!dark)}
            className="group flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-white shadow-2xl backdrop-blur-2xl transition hover:bg-white/15"
            aria-label="Toggle dark mode"
        >
      <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              dark ? "bg-[#ead9a2] text-[#141414]" : "bg-white text-[#141414]"
          }`}
      >
        {dark ? <Moon size={16} /> : <Sun size={16} />}
      </span>

            <span className="hidden pr-2 text-sm font-black md:block">
        {dark ? "Dark" : "Light"}
      </span>
        </button>
    );
}