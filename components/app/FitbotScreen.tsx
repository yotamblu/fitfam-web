"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api, describeError } from "@/lib/api";
import { buttonClasses } from "../ui/Button";
import ChatPane, { NewChat, PENDING_KEY } from "./FitbotChat";
import FitbotConsent from "./FitbotConsent";
import FitbotList from "./FitbotList";
import { PlusIcon } from "./icons";
import { Card, SectionTitle } from "./primitives";
import { useSession } from "./Session";

/**
 * Fitbot, the AI assistant: the conversation list and a conversation, the way chat apps lay it out. Desktop shows both side
 * by side; a phone shows the empty-chat welcome with the list under it, and an open conversation takes the whole screen
 * (the tab shell hides its bars for `/fitbot/[id]`).
 */
export default function FitbotScreen() {
  const { id } = useParams<{ id?: string }>();
  const router = useRouter();
  const { fitbot, setFitbot } = useSession();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fitbot || !fitbot.available) {
    return (
      <Card className="p-5">
        <h1 className="font-heading text-headline-sm font-bold">Fitbot</h1>
        <p className="mt-1 text-body-md text-text-secondary">Fitbot עדיין לא זמין עבורכם. נעדכן כשיהיה.</p>
      </Card>
    );
  }
  if (!fitbot.aiConsent) return <FitbotConsent />;

  /** Creates the conversation, keeps the first message for its page, and opens it. */
  const start = async (text: string) => {
    setStarting(true);
    setError(null);
    try {
      const chat = await api.createChat();
      setFitbot((o) => o && { ...o, chats: [chat, ...o.chats] });
      window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ id: chat.id, text }));
      router.push(`/fitbot/${chat.id}`);
    } catch (e) {
      setError(describeError(e));
      setStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-10">
      <section className="flex min-w-0 flex-col">
        {id ? <ChatPane key={id} id={id} /> : <NewChat onStart={(text) => void start(text)} busy={starting} error={error} />}
      </section>

      <aside className={`${id ? "hidden lg:flex" : "flex"} ff-rise-in flex-col gap-3 [animation-delay:180ms] lg:sticky lg:top-10`}>
        <SectionTitle aside={fitbot.chats.length > 0 ? `${fitbot.chats.length}` : undefined}>השיחות שלי</SectionTitle>
        <Link href="/fitbot" className={`${buttonClasses({ variant: id ? "primary" : "secondary" })} hidden lg:inline-flex`}>
          <PlusIcon className="size-4" />
          שיחה חדשה
        </Link>
        <FitbotList activeId={id} />
        <p className="px-1 text-label-md text-text-muted">שיחות שלא היו בהן פעילות {fitbot.retentionDays} ימים נמחקות אוטומטית.</p>
      </aside>
    </div>
  );
}
