"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";

type LoginResponse = { message?: string; username?: string };

export default function LoginClient() {
    const router = useRouter();
    const sp = useSearchParams();
    const nextParam = sp.get("next") ?? "/";
    const { setAuth } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                let data: LoginResponse | null = null;
                try {
                    data = (await res.json()) as LoginResponse;
                } catch {}
                setAuth({ username: data?.username ?? username });
                router.replace(nextParam);
                router.refresh();
                return;
            }

            let message = "Giriş başarısız. Kullanıcı adı veya şifre hatalı olabilir.";
            try {
                const body = (await res.json()) as LoginResponse;
                if (body?.message) message = body.message;
            } catch {}
            setError(message);
        } catch {
            setError("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden text-black dark:text-white">
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-slate-900 dark:via-indigo-950 dark:to-black" />
                <div
                    className="absolute inset-0 opacity-25 dark:opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
                    style={{
                        backgroundImage: "url(/login-hero.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            </div>

            <header className="fixed inset-x-0 top-0 z-20 bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-black/10 dark:border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <span className="text-pink-600">🐦</span>
                        <span>Twitter-Clone</span>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <div className="pt-16">
                <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 md:grid-cols-2">
                    <section className="hidden md:block" />
                    <section className="flex items-center justify-center p-6">
                        <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/85 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-black/70">
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <div className="grid gap-1.5">
                                    <label htmlFor="username" className="text-sm font-medium">
                                        Kullanıcı Adı
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        autoComplete="username"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-black outline-none focus:ring-2 dark:border-white/15 dark:bg-black/70 dark:text-white"
                                        placeholder="kullanici_adi"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Şifre
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPw ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="flex-1 rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-black outline-none focus:ring-2 dark:border-white/15 dark:bg-black/70 dark:text-white"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((s) => !s)}
                                            className="rounded-lg border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                                            aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                                            disabled={loading}
                                        >
                                            {showPw ? "Gizle" : "Göster"}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !username || !password}
                                    className="w-full rounded-full bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
                                >
                                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                                </button>

                                <div className="text-center text-sm text-black/70 dark:text-white/70">
                                    Hesabın yok mu? <Link href="/register" className="underline">Kayıt ol</Link>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
