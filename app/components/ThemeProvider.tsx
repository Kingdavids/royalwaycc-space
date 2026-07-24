"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    mounted: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(
    undefined
);

const STORAGE_KEY = "royalwaycc-theme";

function getCurrentTheme(): Theme {
    return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
}

export default function ThemeProvider({
                                          children,
                                      }: {
    children: ReactNode;
}) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    const applyTheme = useCallback((nextTheme: Theme) => {
        const root = document.documentElement;

        root.classList.toggle("dark", nextTheme === "dark");
        root.style.colorScheme = nextTheme;

        localStorage.setItem(STORAGE_KEY, nextTheme);
        setThemeState(nextTheme);
    }, []);

    useEffect(() => {
        setThemeState(getCurrentTheme());
        setMounted(true);
    }, []);

    const setTheme = useCallback(
        (nextTheme: Theme) => {
            applyTheme(nextTheme);
        },
        [applyTheme]
    );

    const toggleTheme = useCallback(() => {
        const currentTheme = getCurrentTheme();

        applyTheme(
            currentTheme === "dark" ? "light" : "dark"
        );
    }, [applyTheme]);

    const value = useMemo(
        () => ({
            theme,
            mounted,
            setTheme,
            toggleTheme,
        }),
        [mounted, setTheme, theme, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}