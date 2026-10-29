"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, describeError, type FitbotChat, type FitbotMessage } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { ChevronRightIcon, SendIcon, SparkIcon } from "./icons";
import FitbotText from "./FitbotText";
import { useSession } from "./Session";
import { Skeleton } from "./ui";

/** A conversation started from the empty screen: the first message waits here while the new chat's page opens. */
export const PENDING_KEY = "ff.fitbot.first";

const SUGGESTIONS = ["מה האימון הבא שלי?", "אני לא מצליח/ה להרים כמו באימון הקודם", "איך מבצעים תרגיל בצורה נכונה?", "מה כדאי לאכול אחרי אימון?"];

export function FitbotAvatar({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-ember/15 text-ember ${className}`}>
      <SparkIcon className="size-[55%]" />
    </span>
  );
}

/** The message box. Enter sends on a computer (Shift+Enter adds a line); on a phone Enter is a new line and the button sends. */
export function Composer({ onSend, busy, autoFocus = false, draft, setDraft }: { onSend: (text: string) => void; busy: boolean; autoFocus?: boolean; draft: string; setDraft: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 140)}px`;
  }, [draft]);

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    onSend(text);
  };

  return (
    <div className="flex items-end gap-2 rounded-3xl bg-white/[0.07] p-1.5 ps-4">
      <textarea
        ref={ref}
        rows={1}
        dir={draft ? "auto" : "rtl"}
        value={draft}
        autoFocus={autoFocus}
        maxLength={2000}
        placeholder="שאלו את Fitbot"
        aria-label="הודעה ל-Fitbot"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
            e.preventDefault();
            submit();
          }
        }}
        className="max-h-36 min-h-10 flex-1 resize-none bg-transparent py-2 text-body-lg leading-6 outline-none placeholder:text-text-muted"
      />
      <button
        type="button"
        aria-label="שליחה"
        disabled={busy || !draft.trim()}
        onClick={() => {
          sfx.tap();
          submit();
        }}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ember text-canvas transition active:scale-95 disabled:bg-white/10 disabled:text-text-muted"
      >
        <SendIcon className="size-5" />
      </button>
    </div>
  );
}

export function Disclaimer({ remaining }: { remaining?: number }) {
  return (
    <p className="px-2 text-center text-label-md text-text-muted">
      Fitbot הוא בינה מלאכותית ויכול לטעות. הוא לא תחליף לרופא או למאמן.
      {remaining !== undefined && remaining <= 5 && <span className="text-ember"> נשארו {Math.max(0, remaining)} הודעות להיום.</span>}
    </p>
  );
}

/** The welcome state: a few ideas to start from, and the box. Starting creates the conversation and opens its page. */
export function NewChat({ onStart, busy, error }: { onStart: (text: string) => void; busy: boolean; error: string | null }) {
  const [draft, setDraft] = useState("");
  const { fitbot } = useSession();
  return (
    <div className="flex flex-col gap-5 lg:h-[calc(100dvh-6rem)] lg:justify-center lg:rounded-2xl lg:bg-surface-raised lg:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <FitbotAvatar className="size-14" />
        <h1 className="font-heading text-headline-md font-bold">Fitbot</h1>
        <p className="max-w-sm text-body-md text-text-secondary">העוזר האישי שלכם לאימונים. שואלים על האימון, התרגילים, ההתקדמות או הקצבים, ומקבלים תשובה לפי התוכנית שלכם.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            type="button"
            disabled={busy}
            onClick={() => {
              sfx.tap();
              onStart(text);
            }}
            className="rounded-full bg-white/[0.07] px-4 py-2 text-body-md transition hover:bg-white/[0.12] active:scale-[0.98] disabled:opacity-60"
          >
            {text}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-center text-body-md text-ember">
          {error}
        </p>
      )}
      <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
        <Composer draft={draft} setDraft={setDraft} busy={busy} onSend={onStart} />
        <Disclaimer remaining={fitbot ? fitbot.dailyLimit - fitbot.usedToday : undefined} />
      </div>
    </div>
  );
}

function Bubble({ message }: { message: FitbotMessage }) {
  if (message.role === "user") {
    return (
      <div className="ff-rise-in flex justify-start">
        <div dir="auto" className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-ss-md bg-ember px-4 py-2.5 text-body-lg text-canvas">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="ff-rise-in flex items-start gap-2.5">
      <FitbotAvatar />
      <div className="flex max-w-[85%] flex-col gap-2">
        <div className="rounded-2xl rounded-ss-md bg-white/[0.07] px-4 py-2.5">
          <FitbotText text={message.content} />
        </div>
        {message.actions.map((action) => (
          <Link
            key={action.workoutId}
            href={`/workout/${action.workoutId}`}
            className="flex h-11 items-center justify-between gap-3 rounded-xl bg-ember/15 px-4 font-heading text-body-md font-bold text-ember transition hover:bg-ember/25"
          >
            <span className="truncate">פתיחת האימון: {action.title}</span>
            <ChevronRightIcon className="size-4 shrink-0 rotate-180" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2.5" role="status" aria-label="Fitbot כותב">
      <FitbotAvatar />
      <div className="flex gap-1.5 rounded-2xl rounded-ss-md bg-white/[0.07] px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="ff-pulse-soft size-2 rounded-full bg-text-secondary" style={{ animationDelay: `${i * 180}ms` }} />
        ))}
      </div>
    </div>
  );
}

/** One open conversation: the messages, the box, and the sending logic (optimistic message, title after the first answer). */
export default function ChatPane({ id }: { id: string }) {
  const { fitbot, setFitbot } = useSession();
  const [chat, setChat] = useState<FitbotChat | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  const send = useCallback(
    async (text: string) => {
      const temp: FitbotMessage = { id: `tmp-${Date.now()}`, role: "user", content: text, actions: [], createdAt: new Date().toISOString() };
      let wasFirst = false;
      setChat((c) => {
        wasFirst = !!c && c.messages.length === 0;
        return c && { ...c, messages: [...c.messages, temp] };
      });
      setDraft("");
      setSendError(null);
      setBusy(true);
      try {
        const result = await api.sendChat(id, text);
        setChat((c) => c && { ...c, messages: [...c.messages.filter((m) => m.id !== temp.id), result.userMessage, result.reply] });
        setFitbot((o) => o && { ...o, usedToday: result.usedToday, dailyLimit: result.dailyLimit });
        sfx.tap();
        if (wasFirst) {
          // the model names the conversation after its first answer; the first words stay if that fails
          void api
            .titleChat(id)
            .then((summary) => {
              setChat((c) => c && { ...c, title: summary.title });
              setFitbot((o) => o && { ...o, chats: o.chats.map((x) => (x.id === id ? { ...x, title: summary.title } : x)) });
            })
            .catch(() => undefined);
        }
        setFitbot((o) => {
          if (!o) return o;
          const now = new Date().toISOString();
          const current = o.chats.find((x) => x.id === id);
          return current ? { ...o, chats: [{ ...current, updatedAt: now }, ...o.chats.filter((x) => x.id !== id)] } : o;
        });
      } catch (e) {
        // nothing was answered and the server took the question back: put the text in the box again
        setChat((c) => c && { ...c, messages: c.messages.filter((m) => m.id !== temp.id) });
        setDraft(text);
        setSendError(describeError(e));
      } finally {
        setBusy(false);
      }
    },
    [id, setFitbot],
  );

  useEffect(() => {
    let cancelled = false;
    api
      .chat(id)
      .then((loaded) => {
        if (cancelled) return;
        setChat(loaded);
        if (started.current || loaded.messages.length > 0) return;
        try {
          const raw = window.sessionStorage.getItem(PENDING_KEY);
          const pending = raw ? (JSON.parse(raw) as { id: string; text: string }) : null;
          if (pending && pending.id === id) {
            started.current = true;
            window.sessionStorage.removeItem(PENDING_KEY);
            void send(pending.text);
          }
        } catch {
          // no stored first message: the conversation simply starts empty
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id, send]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [chat?.messages.length, busy]);

  return (
    <div className="-mx-gutter flex h-dvh flex-col lg:mx-0 lg:h-[calc(100dvh-6rem)] lg:overflow-hidden lg:rounded-2xl lg:bg-surface-raised">
      <header className="flex items-center gap-2 px-gutter pt-[calc(env(safe-area-inset-top)+10px)] pb-2 lg:px-5 lg:pt-4">
        <Link href="/fitbot" aria-label="חזרה לשיחות" className="-ms-2 flex h-10 items-center gap-1 rounded-xl px-2 text-body-md font-semibold text-text-primary/90 hover:bg-white/[0.08] lg:hidden">
          <ChevronRightIcon className="size-5" />
        </Link>
        <FitbotAvatar />
        <h1 dir="auto" className="min-w-0 flex-1 truncate font-heading text-body-lg font-bold">
          {chat?.title ?? "Fitbot"}
        </h1>
      </header>

      <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-gutter py-3 lg:px-6">
        {!chat && !loadError && (
          <>
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-24 w-4/5 self-end rounded-2xl" />
          </>
        )}
        {loadError && (
          <p role="alert" className="text-body-md text-ember">
            {loadError}
          </p>
        )}
        {chat && chat.messages.length === 0 && !busy && <p className="m-auto text-body-md text-text-secondary">שאלו כל דבר על האימונים שלכם.</p>}
        {chat?.messages.map((m) => <Bubble key={m.id} message={m} />)}
        {busy && <Typing />}
      </div>

      <div className="flex flex-col gap-1.5 px-gutter pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)] lg:px-5 lg:pb-4">
        {sendError && (
          <p role="alert" className="px-2 text-body-md text-ember">
            {sendError}
          </p>
        )}
        <Composer draft={draft} setDraft={setDraft} busy={busy || !chat} onSend={(text) => void send(text)} />
        <Disclaimer remaining={fitbot ? fitbot.dailyLimit - fitbot.usedToday : undefined} />
      </div>
    </div>
  );
}
