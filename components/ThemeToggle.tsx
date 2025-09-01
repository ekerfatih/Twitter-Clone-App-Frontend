"use client";

import {Sun, Moon} from "lucide-react";
import {useTheme} from "@/app/providers/ThemeProvider";

export default function ThemeToggle({className = ""}: { className?: string }) {
    const {theme, toggle, mounted} = useTheme();
    if (!mounted) return null;

    return (
        <button
            onClick={toggle}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5
                  border border-black/10 dark:border-white/15
                  hover:bg-black/5 dark:hover:bg-white/10 ${className}`}
            aria-label="Tema değiştir"
        >
            {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}
            <span className="text-sm">{theme === "dark" ? "Aydınlık" : "Karanlık"}</span>
        </button>
    );
}
