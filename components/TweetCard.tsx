import Link from "next/link";
import {parseLocalDateTime, timeAgoText} from "@/lib/date";
import type {Tweet} from "@/types/tweet";
import TweetMenu from "./TweetMenu";
import TweetActionBar from "./TweetActionsBar";

export default function TweetCard({tweet}: { tweet: Tweet }) {
    const when = parseLocalDateTime(tweet.time);

    return (
        <li className="border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-3">
                <div className="text-3xl">🧑‍💻</div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/user/${encodeURIComponent(tweet.username)}`}
                            className="font-semibold text-gray-900 dark:text-white hover:underline"
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

                    <Link
                        href={`/tweet/${tweet.id}`}
                        className="block -mx-2 mt-1 rounded-lg p-2 hover:bg-gray-100/60 dark:hover:bg-gray-900/60"
                    >
                        <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                            {tweet.tweetText}
                        </p>
                    </Link>

                    <TweetActionBar
                        tweetId={tweet.id}
                        replyCount={tweet.commentCount}
                        initialLikeCount={tweet.likeCount}
                        initialRetweetCount={tweet.retweetCount}
                        likedByMe={tweet.likedByMe}
                        retweetedByMe={tweet.retweetByMe}
                        className="mt-1"
                    />
                </div>
            </div>
        </li>
    );
}
