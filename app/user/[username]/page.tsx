import { redirect } from "next/navigation";
import Feed from "@/components/Feed";
import { isTweetArray } from "@/types/tweet";
import { getCookieHeader } from "@/lib/cookies";

export const dynamic = "force-dynamic";

async function fetchUserTweets(username: string) {
    const cookieHeader = await getCookieHeader();             // <<< değişti
    const base = "http://130.61.88.121:9000/workintech";
    const url = `${base}/tweet/user/${encodeURIComponent(username)}`;

    const res = await fetch(url, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
    });

    if (res.status === 401) redirect("/login");
    if (!res.ok) return [];

    const ct = res.headers.get("content-type");

    const data: unknown = await res.json();
    return isTweetArray(data) ? data : [];
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
    const tweets = await fetchUserTweets(params.username);
    return (
        <main className="mx-auto max-w-2xl p-4">
            <h1 className="text-2xl font-semibold mb-4">@{params.username}</h1>
            <Feed tweets={tweets} />
        </main>
    );
}
