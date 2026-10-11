"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, describeError, type CustomerWorkout, type Step } from "@/lib/api";
import {
  BLOCK_LABELS,
  ZONE_HINT,
  clock,
  formatSeconds,
  targetDetails,
  targetHeadline,
} from "@/lib/training";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import ProgressBar from "../ui/ProgressBar";
import { CloseIcon } from "./icons";
import { ProgressRing, Skeleton } from "./ui";
import Video from "./Video";

/** The optional guided mode: one step at a time, rest timers that run by themselves, progress saved as you go. */
export default function PlayerScreen() {
  const id = String(useParams<{ id: string }>().id);
  const router = useRouter();

  const [workout, setWorkout] = useState<CustomerWorkout | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const endAt = useRef<number | null>(null);

  /** Moves to a step and sets up its timer: rests start by themselves, timed work waits for a tap. */
  const goTo = useCallback(
    (list: Step[], next: number, save = true) => {
      const step = list[next];
      setIndex(next);
      const seconds = step.type === "rest" ? step.durationSec : step.type === "timed_block" ? step.durationSec : step.target?.durationSec ?? null;
      if (seconds && seconds > 0) {
        setRemaining(seconds);
        const auto = step.type === "rest";
        setRunning(auto);
        endAt.current = auto ? Date.now() + seconds * 1000 : null;
      } else {
        setRemaining(null);
        setRunning(false);
        endAt.current = null;
      }
      if (save) api.saveProgress(id, next).catch(() => undefined);
    },
    [id],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.workout(id), api.steps(id)])
      .then(([w, s]) => {
        if (cancelled) return;
        setWorkout(w);
        setSteps(s.steps);
        if (s.steps.length > 0) goTo(s.steps, Math.min(s.resumeStep, s.steps.length - 1), false);
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id, goTo]);

  // keep the screen on while training (not every browser has it)
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => undefined);
    return () => {
      void lock?.release().catch(() => undefined);
    };
  }, []);

  const step = steps?.[index] ?? null;
  const last = steps ? index === steps.length - 1 : false;

  const advance = useCallback(() => {
    if (!steps) return;
    if (index < steps.length - 1) goTo(steps, index + 1);
  }, [steps, index, goTo]);

  // countdown: derived from a timestamp so a throttled background tab does not drift
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (endAt.current === null) return;
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(timer);
        setRunning(false);
        try {
          navigator.vibrate?.([200, 100, 200]);
        } catch {
          // vibration is a nicety
        }
        if (step?.type === "rest") advance();
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, step, advance]);

  const toggleTimer = () => {
    if (remaining === null) return;
    if (running) {
      setRunning(false);
      endAt.current = null;
    } else {
      endAt.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  const adjustRest = (delta: number) => {
    if (remaining === null) return;
    const next = Math.max(1, remaining + delta);
    setRemaining(next);
    if (running) endAt.current = Date.now() + next * 1000;
  };

  const finish = async () => {
    setFinishing(true);
    setError(null);
    try {
      if (workout?.type === "challenge") {
        router.replace(`/workout/${id}`);
        return;
      }
      await api.complete(id);
      router.replace(`/workout/${id}`);
    } catch (e) {
      setError(describeError(e));
      setFinishing(false);
    }
  };

  if (error && !steps) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-gutter text-center">
        <p role="alert" className="text-body-lg text-ember">
          {error}
        </p>
        <Link href={`/workout/${id}`} className="text-body-md font-bold text-ember">
          חזרה לאימון
        </Link>
      </main>
    );
  }
  if (!steps || !step) {
    if (steps && steps.length === 0) {
      return (
        <main className="flex min-h-dvh items-center justify-center">
          <p role="status" className="text-body-md text-text-secondary">
            באימון הזה עוד אין שלבים.
          </p>
        </main>
      );
    }
    return <PlayerSkeleton />;
  }
  const isRest = step.type === "rest";
  const nextStep = steps[index + 1];

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col lg:max-w-3xl">
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden`}>
        <div className={`absolute -top-44 left-1/2 size-[460px] -translate-x-1/2 rounded-full blur-[120px] ${isRest ? "bg-volt/20" : "bg-ember/25"}`} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-status-tint via-status-tint/60 to-transparent" />

      <header className="relative z-20 flex flex-col gap-3 px-gutter pt-[calc(env(safe-area-inset-top)+16px)] lg:px-10 lg:pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/workout/${id}`}
            aria-label="יציאה מהאימון המונחה"
            className="flex size-10 items-center justify-center rounded-full border border-border-emphasis bg-surface-raised/80 backdrop-blur-md"
          >
            <CloseIcon />
          </Link>
          <p dir="rtl" className="text-body-md text-text-secondary">
            שלב <span dir="ltr" className="font-bold text-text-primary tabular-nums">{index + 1}/{steps.length}</span>
          </p>
        </div>
        <ProgressBar value={index + 1} max={steps.length} label="התקדמות באימון" tone={isRest ? "volt" : "ember"} />
      </header>

      <main key={index} className="ff-slide-in relative z-10 flex flex-1 flex-col gap-5 px-gutter pt-8 pb-6 lg:px-10 lg:pt-12">
        {error && (
          <p role="alert" className="text-body-md text-ember">
            {error}
          </p>
        )}

        {step.sectionTitle && <Chip className="self-start">{step.sectionTitle}</Chip>}

        {isRest ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="font-heading text-headline-md font-bold text-volt">מנוחה</p>
            <ProgressRing value={(remaining ?? 0) / Math.max(step.durationSec ?? 1, remaining ?? 1)} size={230} stroke={12} tone="volt">
              <span dir="ltr" className="font-heading text-[64px] leading-none font-extrabold tabular-nums">
                {clock(remaining ?? 0)}
              </span>
            </ProgressRing>
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => adjustRest(-15)}>
                −15
              </Button>
              <Button variant="secondary" size="sm" onClick={() => adjustRest(15)}>
                +15
              </Button>
            </div>
            {nextStep?.target && (
              <p className="mt-4 text-body-md text-text-secondary">
                הבא: <span className="font-bold text-text-primary">{nextStep.target.exercise?.nameHe ?? "תרגיל"}</span>
              </p>
            )}
          </div>
        ) : step.type === "timed_block" ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-label-md font-semibold text-ember">{BLOCK_LABELS[step.blockStyle] ?? step.blockStyle}</p>
              <h2 className="font-heading text-display-hero-mobile font-extrabold">
                {step.durationSec ? formatSeconds(step.durationSec) : step.roundCount ? `${step.roundCount} סבבים` : "בלוק"}
              </h2>
              {step.capSec !== null && <p className="text-body-md text-text-secondary">תקרת זמן: {formatSeconds(step.capSec)}</p>}
              {step.blockStyle === "emom" && step.intervalSec && (
                <p className="text-body-md text-text-secondary">כל {formatSeconds(step.intervalSec)} מתחילים סיבוב חדש</p>
              )}
            </div>
            <ul className="flex flex-col gap-2">
              {(step.targets ?? []).map((t, i) => (
                <li key={i} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <span className="font-heading text-body-lg font-bold">{t.exercise?.nameHe ?? "תרגיל"}</span>
                  <span className="mt-0.5 block text-body-md text-text-secondary">{[targetHeadline(t), ...targetDetails(t)].join(" · ")}</span>
                </li>
              ))}
            </ul>
            {step.blockNotes && <p className="text-body-md text-text-secondary">{step.blockNotes}</p>}
            {remaining !== null && <TimerFace remaining={remaining} />}
          </div>
        ) : (
          step.target && (
            <div className="flex flex-col gap-4">
              <div>
                {step.setCount !== null && step.setCount > 1 && step.setNumber !== null && (
                  <p className="text-label-md font-semibold text-ember">
                    {step.blockStyle === "endurance" ? "חזרה" : "סט"} {step.setNumber} מתוך {step.setCount}
                  </p>
                )}
                {step.roundNumber !== null && step.roundCount !== null && (
                  <p className="text-label-md font-semibold text-ember">
                    סבב {step.roundNumber} מתוך {step.roundCount}
                  </p>
                )}
                <h2 className="font-heading text-display-hero-mobile font-extrabold">{step.target.exercise?.nameHe ?? "תרגיל"}</h2>
              </div>
              <p className="font-heading text-headline-md font-bold text-ember">{targetHeadline(step.target)}</p>
              {targetDetails(step.target).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {targetDetails(step.target).map((d) => (
                    <Chip key={d} tone="info">
                      {d}
                    </Chip>
                  ))}
                </div>
              )}
              {step.target.zone !== null && <p className="text-label-md text-text-muted">{ZONE_HINT}</p>}
              {remaining !== null && <TimerFace remaining={remaining} />}
              {step.target.notesHe && <p className="text-body-md text-text-secondary">{step.target.notesHe}</p>}
              {step.blockNotes && <p className="text-body-md text-text-secondary">{step.blockNotes}</p>}
              {step.target.exercise?.cuesHe && (
                <p className="rounded-xl border border-border bg-surface p-3 text-body-md text-text-secondary">{step.target.exercise.cuesHe}</p>
              )}
              {step.target.exercise?.youtubeId && <Video youtubeId={step.target.exercise.youtubeId} title={step.target.exercise.nameHe} />}
            </div>
          )
        )}
      </main>

      <footer className="relative z-20 flex items-center gap-3 border-t border-border bg-canvas/90 px-gutter pt-4 lg:px-10 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-xl">
        <Button variant="secondary" size="lg" disabled={index === 0} onClick={() => goTo(steps, index - 1)} aria-label="לשלב הקודם">
          הקודם
        </Button>
        {remaining !== null && !isRest && (
          <Button variant="secondary" size="lg" onClick={toggleTimer}>
            {running ? "השהיה" : "הפעלת טיימר"}
          </Button>
        )}
        {last ? (
          <Button size="lg" className="flex-1" disabled={finishing} onClick={() => void finish()}>
            {finishing ? "שומר..." : workout?.type === "challenge" ? "לסיכום האתגר" : "סיום האימון"}
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={advance}>
            {isRest ? "דילוג על המנוחה" : "בוצע, הלאה"}
          </Button>
        )}
      </footer>
    </div>
  );
}

function TimerFace({ remaining }: { remaining: number }) {
  return (
    <p dir="ltr" className="text-center font-heading text-[64px] leading-none font-extrabold tabular-nums">
      {clock(remaining)}
    </p>
  );
}

function PlayerSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-gutter pt-[calc(env(safe-area-inset-top)+24px)] lg:max-w-3xl lg:px-10" role="status" aria-label="טוען את האימון">
      <div className="flex items-center justify-between">
        <Skeleton className="size-10 !rounded-full" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-2 w-full !rounded-full" />
      <Skeleton className="mt-6 h-6 w-24 !rounded-md" />
      <Skeleton className="h-14 w-3/4" />
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-28" />
    </div>
  );
}
