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
import { Card } from "./primitives";
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
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[18rem_1fr] lg:items-start lg:gap-6">
      <aside className={`${id ? "hidden lg:flex" : "order-2 flex lg:order-none"} flex-col gap-3 lg:sticky lg:top-10`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-body-lg font-bold">השיחות שלי</h2>
          <Link href="/fitbot" className={`${buttonClasses({ variant: "secondary", size: "sm" })} hidden lg:inline-flex`}>
            <PlusIcon className="size-4" />
            שיחה חדשה
          </Link>
        </div>
        <FitbotList activeId={id} />
        <p className="px-1 text-label-md text-text-muted">שיחות שלא היו בהן פעילות {fitbot.retentionDays} ימים נמחקות אוטומטית.</p>
      </aside>

      <section className={id ? "flex flex-col" : "order-1 flex flex-col lg:order-none"}>
        {id ? <ChatPane key={id} id={id} /> : <NewChat onStart={(text) => void start(text)} busy={starting} error={error} />}
      </section>
    </div>
  );
}
