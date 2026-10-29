"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, describeError } from "@/lib/api";
import Button, { buttonClasses } from "../ui/Button";
import { FitbotMark } from "./FitbotChat";
import FitbotConsent from "./FitbotConsent";
import { ChevronRightIcon } from "./icons";
import { Card } from "./primitives";
import { useSession } from "./Session";

/**
 * Where "talk to Fitbot about this workout" lands. It makes sure the customer has agreed to the AI notice, asks the API to
 * open the conversation about that workout (Fitbot writes the first message, which takes a few seconds; asking again for
 * the same workout returns the same conversation), then moves on to the conversation.
 */
export default function FitbotAfterWorkout() {
  const workoutId = String(useParams<{ workoutId: string }>().workoutId);
  const router = useRouter();
  const { fitbot, setFitbot } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const ready = Boolean(fitbot?.available && fitbot.aiConsent);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    api
      .chatAfterWorkout(workoutId)
      .then((chat) => {
        if (cancelled) return;
        setFitbot((o) => o && { ...o, chats: [{ id: chat.id, title: chat.title, updatedAt: chat.updatedAt }, ...o.chats.filter((c) => c.id !== chat.id)] });
        router.replace(`/fitbot/${chat.id}`);
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [ready, workoutId, attempt, router, setFitbot]);

  const back = (
    <Link href={`/workout/${workoutId}`} className="-ms-2 flex h-10 w-fit items-center gap-1 rounded-xl px-2 text-body-md font-semibold text-text-primary/90 transition-colors hover:bg-white/[0.08]">
      <ChevronRightIcon className="size-5" />
      חזרה
    </Link>
  );

  if (!fitbot || !fitbot.available) {
    return (
      <div className="flex flex-col gap-4 pt-[calc(env(safe-area-inset-top)+14px)]">
        {back}
        <Card className="p-5">
          <h1 className="font-heading text-headline-sm font-bold">Fitbot</h1>
          <p className="mt-1 text-body-md text-text-secondary">Fitbot עדיין לא זמין עבורכם.</p>
        </Card>
      </div>
    );
  }

  if (!fitbot.aiConsent) {
    return (
      <div className="flex flex-col gap-4 px-0 pt-[calc(env(safe-area-inset-top)+14px)] lg:pt-0">
        {back}
        <FitbotConsent />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-gutter text-center">
      <FitbotMark size={88} value={1} />
      {error ? (
        <>
          <p role="alert" className="max-w-xs text-body-lg text-ember">
            {error}
          </p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                setError(null);
                setAttempt((n) => n + 1);
              }}
            >
              ניסיון נוסף
            </Button>
            <Link href="/home" className={buttonClasses({ variant: "secondary", size: "lg", fullWidth: true })}>
              חזרה לבית
            </Link>
          </div>
        </>
      ) : (
        <div role="status" className="flex flex-col items-center gap-3">
          <h1 className="font-heading text-headline-sm font-bold">Fitbot מסכם איתכם את האימון</h1>
          <p className="text-body-md text-text-secondary">זה לוקח כמה שניות.</p>
          <span className="mt-1 flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="ff-pulse-soft size-2 rounded-full bg-text-secondary" style={{ animationDelay: `${i * 180}ms` }} />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
