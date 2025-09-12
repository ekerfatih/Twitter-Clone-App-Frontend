"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LogoutButton() {
  const router = useRouter();
  const { setAuth } = useAuth();

  async function onLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        alert("Çıkış yapılamadı.");
        return;
      }
      document.cookie = "access_token=; Max-Age=0; Path=/";
      setAuth?.(null);
      router.replace("/login");
    } catch (e) {
      console.error(e);
      alert("Sunucuya ulaşılamadı.");
    }
  }

  return <button onClick={onLogout}>Çıkış</button>;
}
