"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LogoutButton() {
    const router = useRouter();
    const { setAuth } = useAuth();

    async function onLogout() {
        const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        if (res.ok || res.status === 204) {
            setAuth(null);
            router.replace("/login");
        } else {
            alert("Çıkış başarısız.");
        }
    }

    return <button onClick={onLogout} className="rounded-lg border px-3 py-2">Çıkış Yap</button>;
}
