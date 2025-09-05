import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import CommentForm from "@/components/CommentForm";
import Comments from "@/components/Comments";
import TweetActionBar from "@/components/TweetActionsBar";
import TweetMenu from "@/components/TweetMenu";
import { parseLocalDateTime, timeAgoText } from "@/lib/date";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isTweet, type Tweet } from "@/types/tweet";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://130.61.88.121:9000/workintech").replace(/\/+$/, "");

function isJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

async function fetchTweet(id: number): Promise<Tweet | null> {
    const token = (await cookies()).get("access_token")?.value ?? "";
    let res: Response;
    try {
        res = await fetch(`${BACKEND}/tweet/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: "no-store",
            redirect: "manual",
        });
    } catch {
        return null;
    }
    if (!res.ok) return null;
    const ct = res.headers.get("content-type");
    if (!isJson(ct)) return null;
    const raw = await res.text();
    try {
        const data: unknown = raw ? JSON.parse(raw) : null;
        return isTweet(data) ? data : null;
    } catch {
        return null;
    }
}

export default async function TweetDetailPage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum) || idNum <= 0) notFound();

    const tweet = await fetchTweet(idNum);
    if (!tweet) notFound();

    const when = parseLocalDateTime(tweet.time);

    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            <div className="mx-auto flex max-w-7xl">
                <Sidebar />
                <section className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 backdrop-blur dark:border-gray-800 dark:bg-black/90">
                        <h1 className="text-xl font-semibold">Tweet</h1>
                    </div>

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

                                <p className="mt-3 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                                    {tweet.tweetText}
                                </p>

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

                    <div id="reply" className="p-4">
                        <CommentForm tweetId={idNum} variant="flat" />
                    </div>

                    <div className="p-4 pt-0">
                        <Comments tweetId={idNum} tweetOwner={tweet.username} />
                    </div>
                </section>
                <RightSidebar />
            </div>
        </main>
    );
}
