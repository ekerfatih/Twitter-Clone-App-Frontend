"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegisterRequest = {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};

type RegisterOk = {
    id?: number;
    username?: string;
    message?: string;
};

type ErrorPayload = {
    message?: string;
    errors?: Partial<Record<keyof RegisterRequest, string>>;
};

type FieldErrors = Partial<
    Record<keyof RegisterRequest | "confirmPassword", string>
>;

function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

function isRegisterOk(x: unknown): x is RegisterOk {
    if (!isRecord(x)) return false;
    if ("id" in x && typeof (x as Record<string, unknown>).id !== "number")
        return false;
    if ("username" in x && typeof (x as Record<string, unknown>).username !== "string")
        return false;
    if ("message" in x && typeof (x as Record<string, unknown>).message !== "string")
        return false;
    return true;
}

function isErrorPayload(x: unknown): x is ErrorPayload {
    if (!isRecord(x)) return false;
    if ("message" in x && typeof (x as Record<string, unknown>).message !== "string")
        return false;
    if ("errors" in x) {
        const v = (x as Record<string, unknown>).errors;
        if (!isRecord(v)) return false;
        for (const key of Object.keys(v)) {
            const val = (v as Record<string, unknown>)[key];
            if (typeof val !== "string") return false;
        }
    }
    return true;
}

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState<RegisterRequest>({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    });

    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [showPw, setShowPw] = useState<boolean>(false);
    const [showPw2, setShowPw2] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const passwordsMatch = confirmPassword === form.password;

    const canSubmit =
        form.username.trim().length > 0 &&
        form.email.trim().length > 0 &&
        form.password.trim().length > 0 &&
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0 &&
        passwordsMatch;

    function handleChange<K extends keyof RegisterRequest>(
        key: K,
        value: RegisterRequest[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            if (key === "password") {
                if (confirmPassword && value !== confirmPassword) {
                    next.confirmPassword = "Şifreler uyuşmuyor.";
                } else {
                    delete next.confirmPassword;
                }
            }
            return next;
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading || !canSubmit) return;

        if (form.password !== confirmPassword) {
            setFieldErrors((prev) => ({ ...prev, confirmPassword: "Şifreler uyuşmuyor." }));
            return;
        }

        setError(null);
        setFieldErrors({});
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const ct = res.headers.get("content-type");

            if (res.ok) {
                if (looksJson(ct)) {
                    try {
                        const parsed: unknown = await res.json();
                        if (!isRegisterOk(parsed)) {
                        }
                    } catch {
                    }
                }
                router.replace("/login");
                return;
            }

            if (looksJson(ct)) {
                try {
                    const parsedErr: unknown = await res.json();
                    if (isErrorPayload(parsedErr)) {
                        if (parsedErr.message) setError(parsedErr.message);
                        if (parsedErr.errors) {
                            setFieldErrors((prev) => ({ ...prev, ...parsedErr.errors }));
                        }
                        if (!parsedErr.message && !parsedErr.errors) {
                            setError("Kayıt başarısız.");
                        }
                        return;
                    }
                } catch {
                    /* no-op */
                }
            }

            setError("Kayıt başarısız.");
        } catch {
            setError("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 p-6 shadow-sm">
                {/* Bilgilendirme */}
                {/*<p className="mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 text-center text-sm">*/}
                {/*    Kayıt fonksiyonu kapatılmıştır. Demo için lütfen iletişime geçiniz.*/}
                {/*</p>*/}

                <h1 className="text-2xl font-semibold mb-4">Kayıt Ol</h1>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Username */}
                    <div className="grid gap-1.5">
                        <label htmlFor="username" className="text-sm font-medium">
                            Kullanıcı Adı
                        </label>
                        <input
                            id="username"
                            name="username"
                            required
                            maxLength={20}
                            value={form.username}
                            onChange={(e) => handleChange("username", e.currentTarget.value)}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2"
                            placeholder="kullanici_adi"
                            disabled={loading}
                        />
                        {fieldErrors.username && (
                            <p className="text-xs text-red-600">{fieldErrors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="grid gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium">
                            E-posta
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            maxLength={40}
                            value={form.email}
                            onChange={(e) => handleChange("email", e.currentTarget.value)}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2"
                            placeholder="ornek@mail.com"
                            disabled={loading}
                        />
                        {fieldErrors.email && (
                            <p className="text-xs text-red-600">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="grid gap-1.5">
                        <label htmlFor="password" className="text-sm font-medium">
                            Şifre
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="password"
                                name="password"
                                type={showPw ? "text" : "password"}
                                required
                                maxLength={100}
                                value={form.password}
                                onChange={(e) => handleChange("password", e.currentTarget.value)}
                                className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2"
                                placeholder="••••••••"
                                disabled={loading}
                                aria-invalid={Boolean(fieldErrors.password) || !passwordsMatch}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((s) => !s)}
                                className="rounded-lg border px-3 py-2 text-sm"
                                aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                                disabled={loading}
                            >
                                {showPw ? "Gizle" : "Göster"}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="text-xs text-red-600">{fieldErrors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Şifre (Tekrar)
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPw2 ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    const val = e.currentTarget.value;
                                    setConfirmPassword(val);
                                    setFieldErrors((prev) => {
                                        const next = { ...prev };
                                        if (val && val !== form.password) {
                                            next.confirmPassword = "Şifreler uyuşmuyor.";
                                        } else {
                                            delete next.confirmPassword;
                                        }
                                        return next;
                                    });
                                }}
                                className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2"
                                placeholder="••••••••"
                                disabled={loading}
                                aria-invalid={Boolean(fieldErrors.confirmPassword) || !passwordsMatch}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw2((s) => !s)}
                                className="rounded-lg border px-3 py-2 text-sm"
                                aria-label={showPw2 ? "Şifreyi gizle" : "Şifreyi göster"}
                                disabled={loading}
                            >
                                {showPw2 ? "Gizle" : "Göster"}
                            </button>
                        </div>
                        {(!passwordsMatch || fieldErrors.confirmPassword) && (
                            <p className="text-xs text-red-600">
                                {fieldErrors.confirmPassword ?? "Şifreler uyuşmuyor."}
                            </p>
                        )}
                    </div>

                    {/* First Name */}
                    <div className="grid gap-1.5">
                        <label htmlFor="firstName" className="text-sm font-medium">
                            Ad
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            required
                            maxLength={20}
                            value={form.firstName}
                            onChange={(e) => handleChange("firstName", e.currentTarget.value)}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2"
                            placeholder="Adınız"
                            disabled={loading}
                        />
                        {fieldErrors.firstName && (
                            <p className="text-xs text-red-600">{fieldErrors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="grid gap-1.5">
                        <label htmlFor="lastName" className="text-sm font-medium">
                            Soyad
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            required
                            maxLength={20}
                            value={form.lastName}
                            onChange={(e) => handleChange("lastName", e.currentTarget.value)}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2"
                            placeholder="Soyadınız"
                            disabled={loading}
                        />
                        {fieldErrors.lastName && (
                            <p className="text-xs text-red-600">{fieldErrors.lastName}</p>
                        )}
                    </div>

                    {/* Genel hata */}
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
                    >
                        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                    </button>
                </form>
            </div>
        </main>
    );
}
