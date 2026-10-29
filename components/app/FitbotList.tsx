"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, describeError, parseApiDate, type FitbotChatSummary } from "@/lib/api";
import { PencilIcon, TrashIcon } from "./icons";
import { useSession } from "./Session";

function whenLabel(value: string): string {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return "היום";
  if (days === 1) return "אתמול";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

/** The conversations of the signed-in customer: open, rename, delete. */
export default function FitbotList({ activeId }: { activeId?: string }) {
  const router = useRouter();
  const { fitbot, setFitbot } = useSession();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chats = fitbot?.chats ?? [];

  const rename = async (chat: FitbotChatSummary) => {
    const title = draft.trim();
    setRenaming(null);
    if (!title || title === chat.title) return;
    try {
      const updated = await api.renameChat(chat.id, title);
      setFitbot((o) => o && { ...o, chats: o.chats.map((c) => (c.id === chat.id ? { ...c, title: updated.title } : c)) });
    } catch (e) {
      setError(describeError(e));
    }
  };

  const remove = async (chat: FitbotChatSummary) => {
    setDeleting(null);
    try {
      await api.deleteChat(chat.id);
      setFitbot((o) => o && { ...o, chats: o.chats.filter((c) => c.id !== chat.id) });
      if (chat.id === activeId) router.replace("/fitbot");
    } catch (e) {
      setError(describeError(e));
    }
  };

  if (chats.length === 0) {
    return <p className="rounded-2xl bg-surface-raised p-4 text-body-md text-text-secondary">עוד אין שיחות. שאלו משהו ונתחיל.</p>;
  }

  return (
    <>
      {error && (
        <p role="alert" className="text-body-md text-ember">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {chats.map((chat) => {
          const active = chat.id === activeId;
          return (
            <li key={chat.id}>
              {renaming === chat.id ? (
                <input
                  autoFocus
                  dir="auto"
                  value={draft}
                  maxLength={80}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => void rename(chat)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void rename(chat);
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="h-12 w-full rounded-xl bg-white/[0.08] px-3 text-body-lg outline-2 outline-ember"
                  aria-label="שם השיחה"
                />
              ) : deleting === chat.id ? (
                <div className="flex h-12 items-center gap-2 rounded-xl bg-ember/10 px-3 text-body-md">
                  <span className="min-w-0 flex-1 truncate">למחוק את השיחה?</span>
                  <button type="button" onClick={() => void remove(chat)} className="h-8 rounded-lg bg-ember px-3 font-bold text-canvas">
                    מחיקה
                  </button>
                  <button type="button" onClick={() => setDeleting(null)} className="h-8 rounded-lg px-2 text-text-secondary hover:text-text-primary">
                    ביטול
                  </button>
                </div>
              ) : (
                <div className={`group flex h-12 items-center rounded-xl transition ${active ? "bg-white/10" : "hover:bg-white/5"}`}>
                  <Link href={`/fitbot/${chat.id}`} className="flex h-full min-w-0 flex-1 items-center gap-3 ps-3">
                    <span className="min-w-0 flex-1 truncate text-body-lg" dir="auto">
                      {chat.title}
                    </span>
                    <span className="shrink-0 text-label-md text-text-muted">{whenLabel(chat.updatedAt)}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="שינוי שם"
                    onClick={() => {
                      setDraft(chat.title);
                      setRenaming(chat.id);
                    }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/10 hover:text-text-primary"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="מחיקה"
                    onClick={() => setDeleting(chat.id)}
                    className="me-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/10 hover:text-ember"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
