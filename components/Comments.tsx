import { headers } from "next/headers";
import { getCookieHeader } from "@/lib/cookies";
import CommentRow from "./CommentRow";
import { isCommentArray, type Comment } from "@/types/comment";

function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

async function fetchComments(tweetId: number): Promise<Comment[]> {
    const cookieHeader = await getCookieHeader();

    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (!host) throw new Error("Host header missing; cannot build absolute URL.");
    const origin = `${proto}://${host}`;

    const res = await fetch(`${origin}/api/comment/${tweetId}`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });

    if (!res.ok) return [];
    const ct = res.headers.get("content-type");
    if (!looksJson(ct)) return [];
    const data: unknown = await res.json();
    return isCommentArray(data) ? data : [];
}

export default async function Comments({
                                           tweetId,
                                           tweetOwner,
                                       }: {
    tweetId: number;
    tweetOwner?: string;
}) {
    const comments = await fetchComments(tweetId);

    if (comments.length === 0) {
        return <p className="text-sm text-gray-600 dark:text-gray-400">Henüz yorum yok.</p>;
    }

    return (
        <ul className="space-y-3">
            {comments.map((c) => (
                <CommentRow
                    key={c.id}
                    comment={c}
                    {...(tweetOwner ? { tweetOwner } : {})}
                />
            ))}
        </ul>
    );
}
