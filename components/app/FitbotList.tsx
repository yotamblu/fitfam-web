"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, describeError, type FitbotChatSummary } from "@/lib/api";
import { ChatIcon, PencilIcon, TrashIcon } from "./icons";
import { whenLabel } from "./fitbotUtil";
import { Card, RowList } from "./primitives";
import { useSession } from "./Session";

/** The conversations of the signed-in customer, as a grouped list like the plan list on Home: open, rename, delete. */
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
    return (
      <Card className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-text-muted">
          <ChatIcon className="size-5" />
        </span>
        <p className="text-body-md text-text-secondary">עוד אין שיחות. שאלו משהו ונתחיל.</p>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="text-body-md text-ember">
          {error}
        </p>
      )}
      <RowList>
        {chats.map((chat) => {
          const active = chat.id === activeId;
          return (
            <li key={chat.id} className={active ? "bg-white/[0.06] shadow-[inset_3px_0_0_var(--color-ember)]" : ""}>
              {renaming === chat.id ? (
                <div className="p-2">
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
                    className="h-11 w-full rounded-xl bg-white/[0.08] px-3 text-body-lg outline-2 outline-ember"
                    aria-label="שם השיחה"
                  />
                </div>
              ) : deleting === chat.id ? (
                <div className="flex items-center gap-2 px-4 py-3 text-body-md">
                  <span className="min-w-0 flex-1 truncate">למחוק את השיחה?</span>
                  <button type="button" onClick={() => void remove(chat)} className="h-9 rounded-lg bg-ember px-3 font-heading font-bold text-canvas">
                    מחיקה
                  </button>
                  <button type="button" onClick={() => setDeleting(null)} className="h-9 rounded-lg px-2 text-text-secondary hover:text-text-primary">
                    ביטול
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link href={`/fitbot/${chat.id}`} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${active ? "bg-ember/15 text-ember" : "bg-white/[0.07] text-text-muted"}`}>
                      <ChatIcon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span dir="auto" className="block truncate font-heading text-body-lg font-bold">
                        {chat.title}
                      </span>
                      <span className="block text-label-md text-text-secondary">{whenLabel(chat.updatedAt)}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label="שינוי שם"
                    onClick={() => {
                      setDraft(chat.title);
                      setRenaming(chat.id);
                    }}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/10 hover:text-text-primary"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="מחיקה"
                    onClick={() => setDeleting(chat.id)}
                    className="me-2 flex size-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/10 hover:text-ember"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </RowList>
    </>
  );
}
