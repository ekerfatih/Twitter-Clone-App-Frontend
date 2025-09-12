"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

type Props = {
    tweetId: number;
    tweetOwner: string;
    initialText: string;
};

export default function TweetMenu({ tweetId, tweetOwner, initialText }: Props) {
    const { auth } = useAuth();
    const isOwner = auth?.username === tweetOwner;

    const router = useRouter();
    const pathname = usePathname();

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(initialText);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (
                !menuRef.current ||
                !btnRef.current ||
                menuRef.current.contains(e.target as Node) ||
                btnRef.current.contains(e.target as Node)
            )
                return;
            setOpen(false);
        }
        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setOpen(false);
                setEditing(false);
            }
        }
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    async function onDelete() {
        if (!isOwner) return;
        if (!confirm("Bu tweet silinsin mi?")) return;
        try {
            const res = await fetch(`/api/tweet/${tweetId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok || res.status === 204) {
                if (pathname.startsWith("/tweet/")) router.replace("/");
                router.refresh();
            } else {
                alert("Silme başarısız.");
            }
        } catch {
            alert("Silme sırasında hata oluştu.");
        } finally {
            setOpen(false);
        }
    }

    async function onSave() {
        if (!isOwner || !text.trim()) return;
        setSaving(true);
        setErr(null);
        try {
            const res = await fetch(`/api/tweet/${tweetId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ tweetText: text }),
            });
            if (res.ok) {
                setEditing(false);
                setOpen(false);
                router.refresh();
            } else {
                setErr("Kaydedilemedi.");
            }
        } catch {
            setErr("Ağ hatası.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={() => setOpen((s) => !s)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Tweet menüsü"
            >
                <MoreHorizontal size={16} className="text-gray-400" />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg
                     dark:border-gray-800 dark:bg-black z-10"
                    role="menu"
                >
                    {isOwner && (
                        <>
                            <button
                                onClick={() => {
                                    setEditing(true);
                                    setOpen(false);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
                                role="menuitem"
                            >
                                Düzenle
                            </button>
                            <button
                                onClick={onDelete}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                role="menuitem"
                            >
                                Sil
                            </button>
                        </>
                    )}
                    {!isOwner && (
                        <div className="px-3 py-2 text-sm text-gray-500">Eylem yok</div>
                    )}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-xl
                          dark:border-gray-800 dark:bg-zinc-950">
                        <h3 className="text-lg font-semibold mb-3">Tweet’i düzenle</h3>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={300}
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none
                         focus:ring-2 dark:border-gray-700 dark:bg-black dark:text-white"
                        />
                        <div className="mt-2 text-xs text-gray-500">{text.length}/300</div>
                        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setEditing(false)}
                                className="rounded-lg border px-3 py-1.5 text-sm
                           border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                İptal
                            </button>
                            <button
                                onClick={onSave}
                                disabled={saving || !text.trim()}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                            >
                                {saving ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
