"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

type Props = {
    tweetId: number;
    tweetOwner: string;
    initialText: string;
};

type TweetPatch = { tweetText: string };

function looksJson(ct: string | null): boolean {
    return (ct ?? "").toLowerCase().includes("application/json");
}
const norm = (x?: string | null) =>
    typeof x === "string" ? x.trim().toLowerCase() : null;

export default function TweetActions({ tweetId, tweetOwner, initialText }: Props) {
    const router = useRouter();
    const { auth } = useAuth();

    const me = norm(auth?.username);
    const owner = norm(tweetOwner);
    const isOwner = me !== null && owner !== null && me === owner;

    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(initialText);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    if (!isOwner) return null;

    const MAX = 300;
    const canSave = text.trim().length > 0 && text.length <= MAX && !loading;

    async function onDelete() {
        if (!confirm("Tweet silinsin mi?")) return;

        setLoading(true);
        setErr(null);
        try {
            const res = await fetch(`/api/tweet/${tweetId}`, {
                method: "DELETE",
                credentials: "include",
                headers: { Accept: "application/json" },
                cache: "no-store",
            });

            if (res.status === 401) { window.location.assign("/login"); return; }
            if (res.status === 403) { setErr("Bu tweet'i silme yetkin yok (sadece sahibi silebilir)."); return; }
            if (res.status === 404) { setErr("Tweet bulunamadı (404)."); return; }
            if (!res.ok) {
                let msg = `Silinemedi (HTTP ${res.status}).`;
                const ct = res.headers.get("content-type") ?? "";
                if (ct.includes("application/json")) {
                    try {
                        const obj = (await res.json()) as { message?: string };
                        if (obj?.message) msg = obj.message;
                    } catch {}
                }
                setErr(msg);
                return;
            }

            router.replace("/");
        } catch {
            setErr("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
        } finally {
            setLoading(false);
        }
    }

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;
        setLoading(true); setErr(null);
        const payload: TweetPatch = { tweetText: text.trim() };
        try {
            const res = await fetch(`/api/tweet/${tweetId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                let msg = "Güncelleme başarısız.";
                const ct = res.headers.get("content-type");
                if (looksJson(ct)) {
                    try {
                        const obj = (await res.json()) as unknown as { message?: string };
                        if (obj?.message) msg = obj.message;
                    } catch {}
                }
                setErr(msg); return;
            }
            setEditing(false);
            router.refresh();
        } catch {
            setErr("Sunucuya ulaşılamadı.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-xl border border-blue-900/40 bg-[#0b0f19] p-3 ring-1 ring-blue-900/20">
            {!editing ? (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => { setEditing(true); setErr(null); }}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                        disabled={loading}
                    >
                        Düzenle
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded-lg border border-red-600 text-red-500 px-3 py-1.5 text-sm"
                        disabled={loading}
                    >
                        Sil
                    </button>
                </div>
            ) : (
                <form onSubmit={onSave} className="space-y-2">
          <textarea
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 min-h-[80px]"
              maxLength={MAX}
              disabled={loading}
          />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{MAX - text.length} karakter</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setEditing(false); setText(initialText); setErr(null); }}
                                className="rounded-lg border px-3 py-1.5 text-sm"
                                disabled={loading}
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-black text-white px-3 py-1.5 text-sm disabled:opacity-60"
                                disabled={!canSave}
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                    {err && <p className="text-sm text-red-600">{err}</p>}
                </form>
            )}
            {!editing && err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        </div>
    );
}
