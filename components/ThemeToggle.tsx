"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggle, mounted } = useTheme();
    if (!mounted) return null;

    const isDark = theme === "dark";
    const label = isDark ? "Aydınlık" : "Karanlık";

    return (
        <button
            onClick={toggle}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 ${className}`}
            aria-label="Tema değiştir"
            aria-pressed={isDark}
            title={`Tema: ${label}`}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-sm inline-block w-[68px] text-left">{label}</span>
        </button>
    );
}
