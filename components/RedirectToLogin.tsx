"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToLogin({ next }: { next: string }) {
    const router = useRouter();
    useEffect(() => {
        router.replace(`/login?next=${encodeURIComponent(next)}`);
    }, [router, next]);
    return null;
}