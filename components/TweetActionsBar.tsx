"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, Repeat2, Heart, Share } from "lucide-react";
import { type Tweet } from "@/types/tweet";

type LikeResponse = { tweetId: number; liked: boolean; likeCount: number };
type RetweetResponse = { tweetId: number; retweeted: boolean; retweetCount: number };

function isJson(res: Response): boolean {
    const ct = res.headers.get("content-type") ?? "";
    return ct.toLowerCase().includes("application/json");
}

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
        const nextLiked = !liked;
        const prevLiked = liked;
        const prevLikes = likes;
        setLiked(nextLiked);
        setLikes((n) => (nextLiked ? n + 1 : Math.max(0, n - 1)));
        try {
            const method: "POST" | "DELETE" = nextLiked ? "POST" : "DELETE";
            const res = await fetch(`/api/like/${tweetId}`, {
                method,
                credentials: "include",
            });
            if (res.ok) {
                if (res.status !== 204 && isJson(res)) {
                    const data: unknown = await res.json();
                    if (
                        typeof data === "object" &&
                        data !== null &&
                        typeof (data as LikeResponse).liked === "boolean" &&
                        typeof (data as LikeResponse).likeCount === "number"
                    ) {
                        const d = data as LikeResponse;
                        setLiked(d.liked);
                        setLikes(d.likeCount);
                    }
                }
                router.refresh();
            } else {
                setLiked(prevLiked);
                setLikes(prevLikes);
            }
        } catch {
            setLiked(prevLiked);
            setLikes(prevLikes);
        } finally {
            setBusyLike(false);
        }
    }

    async function onRetweet() {
        if (busyRet) return;
        setBusyRet(true);
        const next = !ret;
        const prev = ret;
        const prevCount = rets;
        setRet(next);
        setRets((n) => (next ? n + 1 : Math.max(0, n - 1)));
        try {
            const method: "POST" | "DELETE" = next ? "POST" : "DELETE";
            const res = await fetch(`/api/retweet/${tweetId}`, {
                method,
                credentials: "include",
            });
            if (res.ok) {
                if (res.status !== 204 && isJson(res)) {
                    const data: unknown = await res.json();
                    if (
                        typeof data === "object" &&
                        data !== null &&
                        typeof (data as RetweetResponse).retweeted === "boolean" &&
                        typeof (data as RetweetResponse).retweetCount === "number"
                    ) {
                        const d = data as RetweetResponse;
                        setRet(d.retweeted);
                        setRets(d.retweetCount);
                    }
                }
                router.refresh();
            } else {
                setRet(prev);
                setRets(prevCount);
            }
        } catch {
            setRet(prev);
            setRets(prevCount);
        } finally {
            setBusyRet(false);
        }
    }

    async function onShare() {
        const url = `${window.location.origin}/tweet/${tweetId}`;
        try {
            if ("share" in navigator && typeof navigator.share === "function") {
                await navigator.share({ url });
            } else if ("clipboard" in navigator && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
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
