"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, Repeat2, Heart, Share } from "lucide-react";

type LikeResponse = { tweetId: number; liked: boolean; likeCount: number };
type RetweetResponse = { tweetId: number; retweeted: boolean; retweetCount: number };

type Props = {
    tweetId: number;
    replyCount?: number;
    initialLikeCount?: number;
    initialRetweetCount?: number;
    likedByMe?: boolean;
    retweetedByMe?: boolean;
    className?: string;
};

export default function TweetActionBar({
                                           tweetId,
                                           replyCount = 0,
                                           initialLikeCount = 0,
                                           initialRetweetCount = 0,
                                           likedByMe = false,
                                           retweetedByMe = false,
                                           className = "",
                                       }: Props) {
    const router = useRouter();
    const [liked, setLiked] = useState<boolean>(likedByMe);
    const [likes, setLikes] = useState<number>(initialLikeCount);
    const [ret, setRet] = useState<boolean>(retweetedByMe);
    const [rets, setRets] = useState<number>(initialRetweetCount);
    const [busyLike, setBusyLike] = useState(false);
    const [busyRet, setBusyRet] = useState(false);

    async function onReply() {
        router.push(`/tweet/${tweetId}#reply`);
    }

    async function onLike() {
        if (busyLike) return;
        setBusyLike(true);
        const prevLiked = liked;
        const prevLikes = likes;
        const nextLiked = !liked;
        setLiked(nextLiked);
        setLikes((n) => (nextLiked ? n + 1 : Math.max(0, n - 1)));
        let ok = false;
        try {
            const method: "POST" | "DELETE" = nextLiked ? "POST" : "DELETE";
            const res = await fetch(`/api/like/${tweetId}`, { method, credentials: "include" });
            if (res.status === 401 || res.status === 403) {
                setLiked(prevLiked);
                setLikes(prevLikes);
                return router.push(`/login?next=${encodeURIComponent(`/tweet/${tweetId}`)}`);
            }
            if (!res.ok) throw new Error();
            if (res.status !== 204 && res.headers.get("content-type")?.toLowerCase().includes("json")) {
                const d = (await res.json()) as LikeResponse;
                if (typeof d.liked === "boolean" && typeof d.likeCount === "number") {
                    setLiked(d.liked);
                    setLikes(d.likeCount);
                }
            }
            ok = true;
        } catch {
            setLiked(prevLiked);
            setLikes(prevLikes);
        } finally {
            setBusyLike(false);
            if (ok) router.refresh();
        }
    }

    async function onRetweet() {
        if (busyRet) return;
        setBusyRet(true);
        const prev = ret;
        const prevCount = rets;
        const next = !ret;
        setRet(next);
        setRets((n) => (next ? n + 1 : Math.max(0, n - 1)));
        let ok = false;
        try {
            const method: "POST" | "DELETE" = next ? "POST" : "DELETE";
            const res = await fetch(`/api/retweet/${tweetId}`, { method, credentials: "include" });
            if (res.status === 401 || res.status === 403) {
                setRet(prev);
                setRets(prevCount);
                return router.push(`/login?next=${encodeURIComponent(`/tweet/${tweetId}`)}`);
            }
            if (!res.ok) throw new Error();
            if (res.status !== 204 && res.headers.get("content-type")?.toLowerCase().includes("json")) {
                const d = (await res.json()) as RetweetResponse;
                if (typeof d.retweeted === "boolean" && typeof d.retweetCount === "number") {
                    setRet(d.retweeted);
                    setRets(d.retweetCount);
                }
            }
            ok = true;
        } catch {
            setRet(prev);
            setRets(prevCount);
        } finally {
            setBusyRet(false);
            if (ok) router.refresh();
        }
    }

    async function onShare() {
        const url = `${window.location.origin}/tweet/${tweetId}`;
        try {
            if (navigator.share) {
                await navigator.share({ url });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                alert("Bağlantı kopyalandı");
            }
        } catch {}
    }

    return (
        <div className={`mt-2 flex max-w-md items-center justify-between text-gray-500 ${className}`}>
            <button onClick={onReply} className="group inline-flex items-center gap-2 hover:text-blue-500" aria-label="Yorumlara git">
        <span className="rounded-full p-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900" aria-hidden>
          <MessageCircle size={16} />
        </span>
                <span className="text-sm">{replyCount}</span>
            </button>

            <button
                onClick={onRetweet}
                disabled={busyRet}
                className={`group inline-flex items-center gap-2 hover:text-green-500 ${ret ? "text-green-500" : ""} disabled:opacity-60`}
                aria-label={ret ? "Retweet’i geri al" : "Retweet"}
            >
        <span className="rounded-full p-2 group-hover:bg-green-100 dark:group-hover:bg-green-900" aria-hidden>
          <Repeat2 size={16} />
        </span>
                <span className="text-sm">{rets}</span>
            </button>

            <button
                onClick={onLike}
                disabled={busyLike}
                className={`group inline-flex items-center gap-2 hover:text-red-500 ${liked ? "text-red-500" : ""} disabled:opacity-60`}
                aria-label={liked ? "Beğeniyi kaldır" : "Beğen"}
            >
        <span className="rounded-full p-2 group-hover:bg-red-100 dark:group-hover:bg-red-900" aria-hidden>
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </span>
                <span className="text-sm">{likes}</span>
            </button>

            <button onClick={onShare} className="group inline-flex items-center gap-2 hover:text-blue-500" aria-label="Paylaş">
        <span className="rounded-full p-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900" aria-hidden>
          <Share size={16} />
        </span>
            </button>
        </div>
    );
}
