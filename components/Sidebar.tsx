"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, Mail, Bookmark, User as UserIcon, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import LogoutButton from "./LogoutButton";

type Item = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };

const NAV: Item[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/messages", label: "Messages", icon: Mail },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { auth } = useAuth();
    const { theme, toggle } = useTheme();

    return (
        <aside className="w-70 p-4 border-r min-h-screen sticky top-0 bg-white border-gray-200 dark:bg-black dark:border-gray-800">
            <div className="text-2xl font-bold text-blue-500 mb-8">🐦 Twitter</div>

            <nav className="space-y-2">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            prefetch={false}
                            className={`flex items-center space-x-3 w-full p-3 rounded-full transition-colors ${
                                active ? "font-semibold" : ""
                            } hover:bg-gray-100 text-black dark:hover:bg-gray-900 dark:text-white`}
                        >
                            <Icon size={24} />
                            <span className="text-xl">{label}</span>
                        </Link>
                    );
                })}

                {auth?.username && (
                    <Link
                        href={`/user/${encodeURIComponent(auth.username)}`}
                        className="mt-2 flex items-center space-x-3 w-full p-3 rounded-full hover:bg-gray-100 text-black dark:hover:bg-gray-900 dark:text-white"
                    >
                        <UserIcon size={24} />
                        <span className="text-xl">Profile</span>
                    </Link>
                )}
            </nav>

            <div className="mt-8">
                <Link
                    href="/tweet/new"
                    className="w-full inline-flex items-center justify-center bg-blue-500 text-white rounded-full py-3 font-semibold hover:bg-blue-600 transition-colors"
                >
                    Tweet
                </Link>
            </div>

            {/* Tema butonu */}
            <button
                onClick={toggle}
                className="flex items-center space-x-3 w-full p-3 rounded-full mt-4 hover:bg-gray-100 text-black dark:hover:bg-gray-900 dark:text-white"
            >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-xl">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <div className="mt-4">
                {auth ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
                        <div className="flex items-center gap-2 truncate">
                            <UserIcon size={18} />
                            <span className="truncate">@{auth.username}</span>
                        </div>
                        <LogoutButton />
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link href="/login" className="flex-1 rounded-full border px-3 py-2 text-sm text-center border-gray-300 text-black dark:border-gray-700 dark:text-white">
                            Giriş
                        </Link>
                        <Link href="/register" className="flex-1 rounded-full bg-black text-white px-3 py-2 text-sm text-center dark:bg-white dark:text-black">
                            Kayıt
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
