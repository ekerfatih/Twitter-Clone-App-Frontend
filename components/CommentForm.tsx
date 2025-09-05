"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types/comment";

export default function CommentForm({ tweetId, maxLen = 300, variant = "card", className = "" }: {
    tweetId: number; maxLen?: number; variant?: "card"|"flat"; className?: string;
}) {
    const router = useRouter();
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const left = maxLen - text.length;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || loading || text.length > maxLen) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/comment/${tweetId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ commentText: text.trim() }),
            });
            if (res.status === 401) {
                document.cookie = "access_token=; Max-Age=0; Path=/";
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                return;
            }
            if (!res.ok) throw new Error(String(res.status));
            const created = (await res.json()) as Comment;
            const payload = { ...created, tweetId };
            window.dispatchEvent(new CustomEvent("comment:created", { detail: payload }));
            setText("");
        } finally {
            setLoading(false);
        }
    }

    const wrapper = variant === "flat" ? "rounded-2xl border border-transparent bg-transparent"
        : "rounded-2xl border border-gray-200 p-4 shadow-sm bg-white dark:bg-zinc-900 dark:border-gray-800";

    return (
        <form onSubmit={onSubmit} className={`${wrapper} ${className}`.trim()} noValidate>
            {variant !== "flat" && <h3 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">Yorum Yaz</h3>}
            <div className="rounded-xl border border-gray-300 bg-white/90 px-3 py-2 outline-none focus-within:ring-2 dark:border-gray-700 dark:bg-black/60">
        <textarea value={text} maxLength={maxLen} onChange={(e) => setText(e.target.value)} rows={4}
                  placeholder="Düşünceni yaz..." className="w-full resize-none bg-transparent text-black placeholder-gray-500 outline-none dark:text-white" disabled={loading}/>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">{left} karakter</span>
                <button type="submit" disabled={loading || !text.trim() || text.length > maxLen}
                        className="rounded-full bg-black px-4 py-1.5 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black">
                    {loading ? "Gönderiliyor..." : "Gönder"}
                </button>
            </div>
        </form>
    );
}
