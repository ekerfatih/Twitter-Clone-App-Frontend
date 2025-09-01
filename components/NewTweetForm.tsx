"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTweetForm() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const MAX = 280;
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch("/api/tweet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ tweetText: text.trim() }),
            });
            if (res.ok) {
                setText("");
                router.refresh();
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border-b p-4 bg-white border-gray-200 dark:bg-black dark:border-gray-800">
            <form onSubmit={onSubmit} className="flex gap-3">
                <div className="text-3xl">😊</div>
                <div className="flex-1">
          <textarea
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              placeholder="What's happening?"
              className="w-full text-xl placeholder-gray-500 resize-none outline-none bg-transparent text-white"
              rows={3}
              maxLength={MAX}
          />
                    <div className="flex items-center justify-between mt-3">
                        <div className="text-gray-500">{text.length}/{MAX}</div>
                        <button
                            type="submit"
                            disabled={!text.trim() || text.length > MAX || loading}
                            className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                        >
                            Tweet
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
