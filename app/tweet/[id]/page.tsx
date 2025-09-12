import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import CommentForm from "@/components/CommentForm";
import Comments from "@/components/Comments";
import TweetActionBar from "@/components/TweetActionsBar";
import TweetMenu from "@/components/TweetMenu";

import { getCookieHeader } from "@/lib/cookies";
import { parseLocalDateTime, timeAgoText } from "@/lib/date";

import Link from "next/link";
import { notFound } from "next/navigation";
import { isTweet, type Tweet } from "@/types/tweet";

export const dynamic = "force-dynamic";

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://s19challange-production.up.railway.app").replace(/\/+$/, "");

function isJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

async function fetchTweet(id: number): Promise<Tweet | null> {
    const cookieHeader = await getCookieHeader();

    let res: Response;
    try {
        res = await fetch(`${BACKEND}/tweet/${id}`, {
            headers: cookieHeader ? { cookie: cookieHeader } : {},
            cache: "no-store",
            redirect: "manual",
        });
    } catch (e) {
        console.error("[tweet detail] network error:", e);
        return null;
    }

    if (!res.ok) {
        console.error("[tweet detail] http", res.status, res.statusText);
        return null;
    }

    const ct = res.headers.get("content-type");
    if (!isJson(ct)) {
        console.error("[tweet detail] not json content-type:", ct);
        return null;
    }

    const raw = await res.text();
    try {
        const data: unknown = raw ? JSON.parse(raw) : null;
        if (isTweet(data)) return data;
        console.error("[tweet detail] payload shape mismatch:", raw.slice(0, 300));
        return null;
    } catch (e) {
        console.error("[tweet detail] json parse error:", e);
        return null;
    }
}

export default async function TweetDetailPage({ params }: { params: { id: string } }) {
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum) || idNum <= 0) notFound();

    const tweet = await fetchTweet(idNum);
    if (!tweet) notFound();

    const when = parseLocalDateTime(tweet.time);

    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            <div className="mx-auto flex max-w-7xl">
                <Sidebar />

                <section className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
                    {/* Üst başlık */}
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur dark:border-gray-800 dark:bg-black/90">
                        <h1 className="text-xl font-semibold">Tweet</h1>
                    </div>

                    {/* Tweet */}
                    <article className="border-b border-gray-200 p-4 dark:border-gray-800">
                        <div className="flex items-start gap-3">
                            <div className="text-3xl">🧑‍💻</div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/user/${encodeURIComponent(tweet.username)}`}
                                        className="font-semibold text-gray-900 hover:underline dark:text-white"
                                    >
                                        @{tweet.username}
                                    </Link>
                                    <span className="text-gray-500">·</span>
                                    <time
                                        className="text-gray-500"
                                        title={when.toLocaleString("tr-TR")}
                                        dateTime={when.toISOString()}
                                    >
                                        {timeAgoText(when)}
                                    </time>

                                    <div className="ml-auto">
                                        <TweetMenu
                                            tweetId={tweet.id}
                                            tweetOwner={tweet.username}
                                            initialText={tweet.tweetText}
                                        />
                                    </div>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-gray-900 dark:text-gray-100">{tweet.tweetText}</p>

                                {/* Action bar'a initial state PASS ET */}
                                <TweetActionBar
                                    tweetId={tweet.id}
                                    replyCount={tweet.commentCount}
                                    initialLikeCount={tweet.likeCount}
                                    initialRetweetCount={tweet.retweetCount}
                                    likedByMe={tweet.likedByMe}
                                    retweetedByMe={tweet.retweetByMe}
                                    className="mt-3"
                                />
                            </div>
                        </div>
                    </article>

                    {/* Yorum yaz – düz (flat) görünüm */}
                    <div id="reply" className="p-4">
                        <CommentForm tweetId={idNum} variant="flat" />
                    </div>

                    {/* Yorumlar */}
                    <div className="p-4 pt-0">
                        <Comments tweetId={idNum} tweetOwner={tweet.username} />
                    </div>
                </section>

                <RightSidebar />
            </div>
        </main>
    );
}
