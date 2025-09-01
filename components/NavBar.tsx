"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const { auth, logoutUiOnly } = useAuth();
    const router = useRouter();

    async function onLogout() {
        const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
        logoutUiOnly();
        if (res.ok || res.status === 204) router.replace("/login");
    }

    return (
        <header className="w-full border-b">
            <div className="mx-auto max-w-5xl flex items-center justify-between p-4">
                <Link href="/" className="text-lg font-semibold">Twitter Clone</Link>

                {auth ? (
                    <div className="flex items-center gap-3">
                        {auth.username && (
                            <Link
                                href={`/user/${encodeURIComponent(auth.username)}`}
                                className="text-sm text-gray-600 hover:underline"
                                prefetch
                            >
                                Merhaba, <span className="font-medium">@{auth.username}</span>
                            </Link>
                        )}
                        <button onClick={onLogout} className="rounded-lg border px-3 py-1.5 text-sm">
                            Çıkış Yap
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="rounded-lg border px-3 py-1.5 text-sm">
                            Giriş Yap
                        </Link>
                        <Link href="/register" className="rounded-lg bg-black text-white px-3 py-1.5 text-sm">
                            Kayıt Ol
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
