export default function RightSidebar() {
    return (
        <aside className="w-80 p-4 min-h-screen sticky top-0 bg-white text-black dark:bg-black dark:text-white">
            <div className="rounded-2xl p-4 mb-4 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold mb-3">{"What's happening"}</h2>
                <div className="space-y-3">
                    {[
                        { k: "tech", h1: "Trending in Technology", h2: "React 19", c: "125K Tweets" },
                        { k: "web", h1: "Trending", h2: "#WebDev", c: "85K Tweets" },
                        { k: "ai", h1: "Technology · Trending", h2: "AI Development", c: "42K Tweets" },
                    ].map((t) => (
                        <div key={t.k} className="cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t.h1}</div>
                            <div className="font-semibold">{t.h2}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t.c}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold mb-3">Who to follow</h2>
                <div className="space-y-3">
                    {[
                        { k: "react", n: "React", h: "@reactjs", a: "⚛️" },
                        { k: "next", n: "Next.js", h: "@nextjs", a: "▲" },
                        { k: "vercel", n: "Vercel", h: "@vercel", a: "🔺" },
                    ].map((u) => (
                        <div key={u.k} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">{u.a}</div>
                                <div>
                                    <div className="font-semibold">{u.n}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-sm">{u.h}</div>
                                </div>
                            </div>
                            <button className="px-4 py-1 rounded-full text-sm font-semibold bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
