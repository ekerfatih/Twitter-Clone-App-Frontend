// app/page.tsx
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import NewTweetForm from "@/components/NewTweetForm";
import Feed from "@/components/Feed";
import { getCookieHeader } from "@/lib/cookies";
import { isTweetArray, type Tweet } from "@/types/tweet";

export const dynamic = "force-dynamic";

const BACKEND = "http://130.61.88.121:9000/workintech";

function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

async function fetchTweets(): Promise<Tweet[]> {
    const cookieHeader = await getCookieHeader();

    try {
        const res = await fetch(`${BACKEND}/tweet`, {
            headers: {
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) return [];
        if (!looksJson(res.headers.get("content-type"))) return [];

        const raw = await res.text();
        if (!raw) return [];

        let data: unknown;
        try {
            data = JSON.parse(raw);
        } catch {
            return [];
        }

        if (!isTweetArray(data)) return [];
        return data as Tweet[];
    } catch {
        return [];
    }
}

export default async function HomePage() {
    const tweets = await fetchTweets();

    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            <div className="flex mx-auto max-w-7xl">
                <Sidebar />
                <section className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
                    <NewTweetForm />
                    <Feed tweets={tweets} />
                </section>
                <RightSidebar />
            </div>
        </main>
    );
}
