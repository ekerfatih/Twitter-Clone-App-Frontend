// app/page.tsx
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import NewTweetForm from "@/components/NewTweetForm";
import Feed from "@/components/Feed";
import {isTweetArray, type Tweet} from "@/types/tweet";
import {cookies} from "next/headers";
import axios from "axios";
import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const token = (await cookies()).get("access_token")?.value ?? "";
    let tweets: Tweet[] = [];

    if (token == "") {
        redirect("/login");
    }


    const base = (process.env.API_BASE_URL ?? "http://130.61.88.121:9000/workintech").replace(/\/$/, "");
    const res = await axios.get(`${base}/tweet`, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
    });
    if (res && res.data) {
        const ct = String(res.headers["content-type"] || "").toLowerCase();
        if (ct.includes("application/json")) {
            const data = res.data;
            if (isTweetArray(data)) tweets = data as Tweet[];
        }
    }


    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
            <div className="flex mx-auto max-w-7xl">
                <Sidebar/>
                <section className="flex-1 max-w-2xl border-x border-gray-200 dark:border-gray-800">
                    <NewTweetForm/>
                    <Feed tweets={tweets}/>
                </section>
                <RightSidebar/>
            </div>
        </main>
    );
}
