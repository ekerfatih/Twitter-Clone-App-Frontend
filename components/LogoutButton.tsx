"use client";
import {useRouter} from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function onLogout() {
        try {
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });

            if (res.ok || res.status === 204) {
                router.replace("/login");
            } else {
                console.error("Logout failed:", res.status);
                alert("Çıkış başarısız.");
            }
        } catch (e) {
            console.error(e);
            alert("Sunucuya ulaşılamadı.");
        }
    }

    return (
        <button onClick={onLogout} className="rounded-lg border px-3 py-2">
            Çıkış Yap
        </button>
    );
}
