"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void; mounted: boolean };

const ThemeCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null)
            ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(saved);
        setMounted(true);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

    return (
        <ThemeCtx.Provider value={{ theme, toggle, setTheme, mounted }}>
            {children}
        </ThemeCtx.Provider>
    );
}

export function useTheme() {
    const v = useContext(ThemeCtx);
    if (!v) throw new Error("useTheme must be used inside ThemeProvider");
    return v;
}
