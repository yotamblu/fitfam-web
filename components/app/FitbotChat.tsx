"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, describeError, type FitbotChat, type FitbotMessage } from "@/lib/api";
import { rankTitle } from "@/lib/gamify";
import { sfx } from "@/lib/sfx";
import { buttonClasses } from "../ui/Button";
import { BoltIcon, ChevronLeftIcon, ChevronRightIcon, FlameIcon, InfoIcon, PlayIcon, RoadIcon, SendIcon, SparkIcon, TrophyIcon } from "./icons";
import FitbotText from "./FitbotText";
import { timeLabel, whenLabel } from "./fitbotUtil";
import { Card, Figure, Meta, RowList, SectionTitle } from "./primitives";
import { useSession } from "./Session";
import { ProgressRing, Skeleton } from "./ui";

/** A conversation started from the empty screen: the first message waits here while the new chat's page opens. */
export const PENDING_KEY = "ff.fitbot.first";

const PROMPTS = [
  { text: "מה האימון הבא שלי?", Icon: RoadIcon },
  { text: "אני לא מצליח/ה להרים כמו באימון הקודם", Icon: BoltIcon },
  { text: "איך מבצעים תרגיל בצורה נכונה?", Icon: InfoIcon },
  { text: "מה כדאי לאכול אחרי אימון?", Icon: TrophyIcon },
];

/** Today's message budget: the ring on Fitbot's mark drains as the day's messages are used. */
export function useBudget() {
  const { fitbot } = useSession();
  const limit = fitbot?.dailyLimit ?? 30;
  const left = Math.max(0, limit - (fitbot?.usedToday ?? 0));
  return { limit, left, ratio: limit > 0 ? left / limit : 1 };
}

/** Fitbot's mark: the app's progress ring around the spark; the ring is what is left of today's messages. */
export function FitbotMark({ size = 48, value = 1 }: { size?: number; value?: number }) {
  const stroke = size >= 56 ? 5 : 4;
  return (
    <ProgressRing value={value} size={size} stroke={stroke}>
      <span className="flex items-center justify-center rounded-full bg-surface-raised text-ember" style={{ width: size - stroke * 2 - 6, height: size - stroke * 2 - 6 }}>
        <SparkIcon className="size-[52%]" />
      </span>
    </ProgressRing>
  );
}

/** The message box. Enter sends on a computer (Shift+Enter adds a line); on a phone Enter is a new line and the button sends. */
export function Composer({ onSend, busy, draft, setDraft, placeholder = "שאלו את Fitbot" }: { onSend: (text: string) => void; busy: boolean; draft: string; setDraft: (value: string) => void; placeholder?: string }) {
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
    <div className="flex items-end gap-2 rounded-xl bg-white/[0.07] p-1.5 ps-4 transition focus-within:bg-white/[0.1] focus-within:ring-1 focus-within:ring-ember/60">
      <textarea
        ref={ref}
        rows={1}
        dir={draft ? "auto" : "rtl"}
        value={draft}
        maxLength={2000}
        placeholder={placeholder}
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
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-ember text-canvas transition active:scale-95 disabled:bg-white/10 disabled:text-text-muted"
      >
        <SendIcon className="size-5" />
      </button>
    </div>
  );
}

export function Disclaimer() {
  const { left, limit } = useBudget();
  return (
    <p className="flex items-start gap-1.5 px-1 text-label-md text-text-muted">
      <InfoIcon className="mt-px size-3.5 shrink-0" />
      <span>
        Fitbot הוא בינה מלאכותית ויכול לטעות. הוא לא תחליף לרופא או למאמן.
        {left <= 5 && (
          <span className="text-ember">
            {" "}
            נשארו <span dir="ltr">{left}</span> מתוך <span dir="ltr">{limit}</span> הודעות להיום.
          </span>
        )}
      </span>
    </p>
  );
}

/** What Fitbot is given about the customer (the same numbers Home shows), so it is clear why its answers fit them. */
function ContextCard() {
  const { stats, activePlan } = useSession();
  if (!stats) return null;
  return (
    <Card className="ff-rise-in divide-y divide-white/[0.06] [animation-delay:200ms]">
      <div className="p-5">
        <p className="text-body-md text-text-secondary">מה Fitbot רואה עליכם</p>
        <p className="mt-1 font-heading text-body-lg font-bold">
          {activePlan ? `${activePlan.planNameHe} · ${activePlan.levelNameHe ?? `רמה ${activePlan.levelNumber}`}` : "עוד אין תוכנית"}
        </p>
        <p className="text-body-md text-text-secondary">
          רמה <span dir="ltr">{stats.level}</span> · {rankTitle(stats.level)}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 p-5">
        <Figure value={`${stats.weekCount}/${stats.weeklyGoal}`} label="אימונים השבוע" />
        <Figure
          value={
            <span className="flex items-center gap-1">
              <FlameIcon filled={stats.weeklyStreak > 0} className={`size-5 ${stats.weeklyStreak > 0 ? "text-ember" : "text-text-muted"}`} />
              {stats.weeklyStreak}
            </span>
          }
          label="שבועות ברצף"
        />
        <Figure value={stats.xp.toLocaleString("en-US")} label="נקודות" tone="text-volt" />
      </div>
      <p className="p-5 text-label-md text-text-secondary">הוא רואה את התוכנית, ההתקדמות והקצבים שלכם, ולא את הצהרת הבריאות או כתובת המייל.</p>
    </Card>
  );
}

/** The welcome state: the box, a few things to ask, and what Fitbot knows. Starting creates the conversation and opens its page. */
export function NewChat({ onStart, busy, error }: { onStart: (text: string) => void; busy: boolean; error: string | null }) {
  const [draft, setDraft] = useState("");
  const { ratio, left, limit } = useBudget();
  return (
    <div className="flex flex-col gap-6 lg:max-w-2xl">
      <header className="ff-rise-in flex items-center gap-4">
        <FitbotMark size={64} value={ratio} />
        <div className="min-w-0">
          <p className="text-body-md text-text-secondary">העוזר האישי שלכם לאימונים</p>
          <h1 className="mt-0.5 font-heading text-headline-md font-bold lg:text-[32px] lg:leading-10">Fitbot</h1>
          <p className="mt-0.5 text-label-md text-text-muted">
            נשארו <span dir="ltr">{left}</span> מתוך <span dir="ltr">{limit}</span> הודעות להיום
          </p>
        </div>
      </header>

      <Card className="ff-rise-in flex flex-col gap-2 p-3 [animation-delay:80ms]">
        <Composer draft={draft} setDraft={setDraft} busy={busy} onSend={onStart} />
        {error && (
          <p role="alert" className="px-1 text-body-md text-ember">
            {error}
          </p>
        )}
        <Disclaimer />
      </Card>

      <div className="ff-rise-in flex flex-col gap-3 [animation-delay:140ms]">
        <SectionTitle>אפשר לשאול</SectionTitle>
        <RowList>
          {PROMPTS.map(({ text, Icon }) => (
            <li key={text}>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  sfx.tap();
                  onStart(text);
                }}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-white/[0.04] disabled:opacity-60"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-text-secondary transition-colors group-hover:bg-ember/15 group-hover:text-ember">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1 text-body-lg">{text}</span>
                <ChevronLeftIcon className="size-5 shrink-0 text-text-muted" />
              </button>
            </li>
          ))}
        </RowList>
      </div>

      <ContextCard />
    </div>
  );
}

function Bubble({ message }: { message: FitbotMessage }) {
  const time = timeLabel(message.createdAt);
  if (message.role === "user") {
    return (
      <div className="ff-rise-in flex flex-col items-start gap-1">
        <div dir="auto" className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-ss-md bg-ember/[0.14] px-4 py-2.5 text-body-lg">
          {message.content}
        </div>
        <span dir="ltr" className="px-1 text-label-md tabular-nums text-text-muted">
          {time}
        </span>
      </div>
    );
  }
  return (
    <div className="ff-rise-in flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-ember/15 text-ember">
        <SparkIcon className="size-5" />
      </span>
      <div className="flex min-w-0 max-w-[92%] flex-col gap-2">
        <p className="font-heading text-label-md font-bold text-ember">Fitbot</p>
        <div className="rounded-2xl rounded-ss-md bg-white/[0.05] px-4 py-3">
          <FitbotText text={message.content} />
        </div>
        {message.actions.map((action) => (
          <Link key={action.workoutId} href={`/workout/${action.workoutId}`} className={`${buttonClasses({ variant: "secondary", size: "md" })} h-auto min-h-14 justify-start gap-3 py-2 text-start`}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ember text-canvas">
              <PlayIcon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-label-md font-medium text-text-secondary">פתיחת האימון</span>
              <span className="block truncate text-body-md">{action.title}</span>
            </span>
          </Link>
        ))}
        <span dir="ltr" className="px-1 text-label-md tabular-nums text-text-muted">
          {time}
        </span>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-start gap-3" role="status" aria-label="Fitbot כותב">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-ember/15 text-ember">
        <SparkIcon className="size-5" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-heading text-label-md font-bold text-ember">Fitbot</p>
        <div className="flex items-center gap-3 rounded-2xl rounded-ss-md bg-white/[0.05] px-4 py-3.5">
          <span className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="ff-pulse-soft size-2 rounded-full bg-text-secondary" style={{ animationDelay: `${i * 180}ms` }} />
            ))}
          </span>
          <span className="text-body-md text-text-secondary">בודק את התוכנית שלכם</span>
        </div>
      </div>
    </div>
  );
}

/** One open conversation: the messages, the box, and the sending logic (optimistic message, title after the first answer). */
export default function ChatPane({ id }: { id: string }) {
  const { setFitbot } = useSession();
  const { left, ratio } = useBudget();
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

  const started_at = chat?.messages[0]?.createdAt;

  return (
    <div className="-mx-gutter flex h-dvh flex-col lg:mx-0 lg:h-[calc(100dvh-6rem)] lg:overflow-hidden lg:rounded-2xl lg:bg-surface-raised">
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-gutter pt-[calc(env(safe-area-inset-top)+10px)] pb-3 lg:px-5 lg:pt-4">
        <Link href="/fitbot" aria-label="חזרה לשיחות" className="-ms-2 flex size-10 shrink-0 items-center justify-center rounded-xl text-text-primary/90 transition-colors hover:bg-white/[0.08] lg:hidden">
          <ChevronRightIcon className="size-5" />
        </Link>
        <FitbotMark size={44} value={ratio} />
        <div className="min-w-0 flex-1">
          <h1 dir="auto" className="truncate font-heading text-body-lg font-bold">
            {chat?.title ?? "Fitbot"}
          </h1>
          <Meta items={[started_at ? whenLabel(started_at) : "שיחה חדשה", `נשארו ${left} הודעות להיום`]} className="!text-label-md" />
        </div>
      </header>

      <div ref={scroller} className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-gutter py-5 lg:px-6">
        {!chat && !loadError && (
          <>
            <Skeleton className="h-10 w-2/3 rounded-2xl" />
            <Skeleton className="h-28 w-5/6 rounded-2xl" />
          </>
        )}
        {loadError && (
          <p role="alert" className="text-body-md text-ember">
            {loadError}
          </p>
        )}
        {chat && chat.messages.length === 0 && !busy && (
          <div className="m-auto flex flex-col items-center gap-3 text-center">
            <FitbotMark size={56} value={ratio} />
            <p className="text-body-md text-text-secondary">שאלו כל דבר על האימונים שלכם.</p>
          </div>
        )}
        {chat?.messages.map((m) => <Bubble key={m.id} message={m} />)}
        {busy && <Typing />}
      </div>

      <div className="flex flex-col gap-2 border-t border-white/[0.06] px-gutter pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] lg:px-5 lg:pb-4">
        {sendError && (
          <p role="alert" className="px-1 text-body-md text-ember">
            {sendError}
          </p>
        )}
        <Composer draft={draft} setDraft={setDraft} busy={busy || !chat} onSend={(text) => void send(text)} />
        <Disclaimer />
      </div>
    </div>
  );
}
