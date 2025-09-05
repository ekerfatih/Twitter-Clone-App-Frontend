"use client";

import { useEffect, useState } from "react";
import CommentRow from "./CommentRow";
import { isCommentArray, type Comment } from "@/types/comment";

function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

export default function Comments({
                                     tweetId,
                                     tweetOwner,
                                 }: {
    tweetId: number;
    tweetOwner?: string;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/comment/${tweetId}`, {
                    credentials: "include",
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!res.ok) {
                    if (!cancelled) setComments([]);
                    return;
                }
                const ct = res.headers.get("content-type");
                if (!looksJson(ct)) {
                    if (!cancelled) setComments([]);
                    return;
                }
                const data: unknown = await res.json();
                if (!cancelled) setComments(isCommentArray(data) ? (data as Comment[]) : []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        function onCreated(e: Event) {
            const c = (e as CustomEvent<Comment & { tweetId?: number; tweet?: { id: number } }>).detail;
            if (!c) return;
            const belongs = c.tweetId === tweetId || c.tweet?.id === tweetId;
            if (!belongs) return;
            setComments((prev) => (prev.some((x) => x.id === c.id) ? prev : [c as Comment, ...prev]));
        }

        function onUpdated(e: Event) {
            const c = (e as CustomEvent<Comment>).detail;
            if (!c) return;
            setComments(prev => prev.map(x => (x.id === c.id ? c : x)));
        }

        function onDeleted(e: Event) {
            const id = (e as CustomEvent<number>).detail;
            if (typeof id !== "number") return;
            setComments((prev) => prev.filter((x) => x.id !== id));
        }

        load();
        window.addEventListener("comment:created", onCreated as EventListener);
        window.addEventListener("comment:updated", onUpdated as EventListener);
        window.addEventListener("comment:deleted", onDeleted as EventListener);

        return () => {
            cancelled = true;
            controller.abort();
            window.removeEventListener("comment:created", onCreated as EventListener);
            window.removeEventListener("comment:updated", onUpdated as EventListener);
            window.removeEventListener("comment:deleted", onDeleted as EventListener);
        };
    }, [tweetId]);

    if (loading) return <p className="text-sm text-gray-600 dark:text-gray-400">Yükleniyor…</p>;
    if (comments.length === 0) return <p className="text-sm text-gray-600 dark:text-gray-400">Henüz yorum yok.</p>;

    return (
        <ul className="space-y-3">
            {comments.map((c) => (
                <CommentRow key={c.id} comment={c} {...(tweetOwner ? { tweetOwner } : {})} />
            ))}
        </ul>
    );
}
