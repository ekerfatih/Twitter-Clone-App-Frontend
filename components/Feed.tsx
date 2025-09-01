import TweetCard from "./TweetCard";
import type { Tweet } from "@/types/tweet";

export default function Feed({ tweets }: { tweets: Tweet[] }) {
    return (
        <section className="flex-1 max-w-2xl">
            <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 p-4">
                <h1 className="text-xl font-semibold">Home</h1>
            </div>
            <ul>{tweets.map(t => <TweetCard key={t.id} tweet={t} />)}</ul>
        </section>
    );
}
