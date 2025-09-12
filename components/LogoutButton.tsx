"use client";
import {useRouter} from "next/navigation";
<<<<<<< HEAD
import {useAuth} from "@/app/providers/AuthProvider";

export default function LogoutButton() {
    const router = useRouter();
    const {setAuth} = useAuth();

    async function onLogout() {
        const res = await fetch("http://130.61.88.121:9000/workintech/logout", {
            method: "POST",
            credentials: "include"
        });
        if (res.ok || res.status === 204) {
            setAuth(null);
            router.replace("/login");
        } else {
            alert("Çıkış başarısız.");
=======

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
>>>>>>> parent of 361d8fb (.)
        }
    }

    return (
        <button onClick={onLogout} className="rounded-lg border px-3 py-2">
            Çıkış Yap
        </button>
    );
}
