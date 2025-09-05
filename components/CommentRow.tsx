"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {parseLocalDateTime, timeAgoText} from "@/lib/date";
import {useAuth} from "@/app/providers/AuthProvider";
import type {Comment} from "@/types/comment";

export default function CommentRow({
                                       comment,
                                       tweetOwner,
                                   }: {
    comment: Comment;
    tweetOwner?: string;
}) {
    const when = parseLocalDateTime(comment.time);
    const {auth} = useAuth();
    const router = useRouter();

    const isCommentOwner = auth?.username === comment.username;
    const isTweetOwner = auth?.username === tweetOwner;
    const canEdit = !!isCommentOwner;
    const canDelete = !!(isCommentOwner || isTweetOwner);

    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(comment.commentText);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function handleDelete() {
        if (!canDelete || busy) return;
        if (!confirm("Yorumu silmek istediğine emin misin?")) return;

        setBusy(true);
        setErr(null);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        // Optimistik kaldır
        window.dispatchEvent(new CustomEvent("comment:deleted", {detail: comment.id}));

        try {
            const res = await fetch(`/api/comment/${comment.id}`, {
                method: "DELETE",
                credentials: "include",
                signal: controller.signal,
            });

            if (res.status === 401) {
                window.dispatchEvent(new CustomEvent("comment:created", {detail: comment}));
                document.cookie = "access_token=; Max-Age=0; Path=/";
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                return;
            }

            if (!(res.ok || res.status === 204)) {
                setErr("Silme başarısız.");
                window.dispatchEvent(new CustomEvent("comment:created", {detail: comment}));
            }
        } catch {
            setErr("Ağ hatası.");
            window.dispatchEvent(new CustomEvent("comment:created", {detail: comment}));
        } finally {
            clearTimeout(timer);
            setBusy(false);
        }
    }

    async function handleSave() {
        if (!canEdit || busy) return;
        const body = text.trim();
        if (!body || body === comment.commentText) {
            setEditing(false);
            return;
        }

        setBusy(true);
        setErr(null);

        const optimistic = {...comment, commentText: body} as Comment;
        window.dispatchEvent(new CustomEvent("comment:updated", {detail: optimistic}));
        setEditing(false);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch(`/api/comment/${comment.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({commentText: body}),
                signal: controller.signal,
            });

            if (res.status === 401) {
                window.dispatchEvent(new CustomEvent("comment:updated", {detail: comment}));
                document.cookie = "access_token=; Max-Age=0; Path=/";
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                return;
            }

            if (!res.ok) {
                setErr("Güncelleme başarısız.");
                window.dispatchEvent(new CustomEvent("comment:updated", {detail: comment}));
                return;
            }

            let server: Comment | null = null;
            try {
                server = (await res.json()) as Comment;
            } catch {
            }
            if (server && server.id === comment.id) {
                window.dispatchEvent(new CustomEvent("comment:updated", {detail: server}));
            }
        } catch {
            setErr("Ağ hatası.");
            window.dispatchEvent(new CustomEvent("comment:updated", {detail: comment}));
        } finally {
            clearTimeout(timer);
            setBusy(false);
        }
    }

    return (
        <li className="p-4 bg-white dark:bg-black">
            <div className="flex gap-3">
                {/* avatar (baş harf) */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500
                        flex items-center justify-center text-white ring-1 ring-black/10 dark:ring-white/10">
          <span className="text-sm font-semibold">
            {comment.username?.[0]?.toUpperCase()}
          </span>
                </div>

                <div className="flex-1 min-w-0">
                    {/* başlık */}
                    <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {comment.username}
            </span>
                        <span className="text-gray-500">@{comment.username}</span>
                        <span className="text-gray-500">·</span>
                        <time
                            className="text-gray-500"
                            title={when.toLocaleString("tr-TR")}
                            dateTime={when.toISOString()}
                        >
                            {timeAgoText(when)}
                        </time>
                    </div>

                    {/* içerik / edit modu */}
                    {!editing ? (
                        <p className="mt-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                            {comment.commentText}
                        </p>
                    ) : (
                        <div className="mt-2">
              <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none
                           focus:ring-2 dark:border-gray-700 dark:bg-black dark:text-white"
                  disabled={busy}
              />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={busy || !text.trim()}
                                    className="rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                                >
                                    Kaydet
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setText(comment.commentText);
                                        setErr(null);
                                    }}
                                    className="rounded-full border px-3 py-1.5 text-sm
                             border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* aksiyonlar */}
                    <div className="mt-2 flex items-center gap-2 text-gray-500">
                        {/* (opsiyonel like butonu yerinde kalabilir) */}
                        {canEdit && !editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-full border border-gray-300 px-2 py-0.5 text-xs
                           dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                                disabled={busy}
                            >
                                Düzenle
                            </button>
                        )}
                        {canDelete && !editing && (
                            <button
                                onClick={handleDelete}
                                className="rounded-full border border-gray-300 px-2 py-0.5 text-xs
                           dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900"
                                disabled={busy}
                            >
                                Sil
                            </button>
                        )}
                        {err && (
                            <span className="ml-2 text-xs text-red-500" role="alert">
                {err}
              </span>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}
