// app/page.tsx
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import NewTweetForm from "@/components/NewTweetForm";
import Feed from "@/components/Feed";
import { getCookieHeader } from "@/lib/cookies";
import { isTweetArray, type Tweet } from "@/types/tweet";

export const dynamic = "force-dynamic";

const BACKEND = "http://130.61.88.121:9000/workintech";

// DEBUG toggle: set env DEBUG=1 or NEXT_PUBLIC_DEBUG=1 to enable in prod
const DEBUG =
    process.env.DEBUG === "1" || process.env.NEXT_PUBLIC_DEBUG === "1" || process.env.NODE_ENV !== "production";
const log = (...a: any[]) => DEBUG && console.log("[fetchTweets]", ...a);

function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}

async function fetchTweets(): Promise<Tweet[]> {
    const cookieHeader = await getCookieHeader();
    const url = `${BACKEND}/tweet`;
    const t0 = Date.now();

    try {
        log("START", { url, hasCookie: Boolean(cookieHeader) });

        const res = await fetch(url, {
            headers: {
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
                Accept: "application/json",
            },
            cache: "no-store",
        });

        log("RES", {
            status: res.status,
            statusText: res.statusText,
            ct: res.headers.get("content-type"),
            xReqId: res.headers.get("x-request-id"),
        });

        if (!res.ok) {
            log("NON_OK_STATUS -> returning []");
            return [];
        }
        if (!looksJson(res.headers.get("content-type"))) {
            log("NON_JSON_CONTENT -> returning []");
            return [];
        }

        const raw = await res.text();
        log("RAW_LEN", raw?.length ?? 0);
        if (!raw) {
            log("EMPTY_BODY -> []");
            return [];
        }

        let data: unknown;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            log("JSON_PARSE_ERROR", String(e).slice(0, 200));
            return [];
        }

        if (!isTweetArray(data)) {
            log("SHAPE_INVALID -> []");
            return [];
        }

        const out = data as Tweet[];
        log("OK", { count: out.length, ms: Date.now() - t0 });
        return out;
    } catch (e) {
        log("FETCH_ERROR", String(e).slice(0, 200), { ms: Date.now() - t0 });
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
