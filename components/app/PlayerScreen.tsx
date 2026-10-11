"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, describeError, type CustomerWorkout, type Step } from "@/lib/api";
import { BLOCK_LABELS, ZONE_HINT, clock, formatSeconds, targetDetails, targetHeadline, targetParts } from "@/lib/training";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { CloseIcon } from "./icons";
import { Meta } from "./primitives";
import { ProgressRing, Skeleton } from "./ui";
import Video from "./Video";

/**
 * The optional guided mode: one step at a time, huge numerals you can read from a metre away, rest timers that start by
 * themselves, and the phase shown by colour (orange while working, green while resting). Progress is saved as you go.
 */
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
      const seconds = step.type === "rest" ? step.durationSec : step.type === "timed_block" ? step.durationSec : (step.target?.durationSec ?? null);
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
    nav.wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => undefined);
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
      if (workout?.type !== "challenge") await api.complete(id);
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
        <Link href={`/workout/${id}`} className="text-body-md font-semibold text-ember">
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
  const target = step.target;
  const parts = target ? targetParts(target) : null;
  const where = [step.sectionTitle, step.setCount !== null && step.setCount > 1 && step.setNumber !== null ? `${step.blockStyle === "endurance" ? "חזרה" : "סט"} ${step.setNumber} מתוך ${step.setCount}` : null, step.roundNumber !== null && step.roundCount !== null ? `סבב ${step.roundNumber} מתוך ${step.roundCount}` : null];

  return (
    <div className={`relative min-h-dvh transition-colors duration-300 ${isRest ? "bg-volt/[0.05]" : ""}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-status-tint/55 to-transparent" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col lg:max-w-3xl">

      <header className="relative z-20 flex flex-col gap-3 px-gutter pt-[calc(env(safe-area-inset-top)+14px)] lg:px-10 lg:pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/workout/${id}`}
            aria-label="יציאה מהאימון המונחה"
            className="-ms-2 flex size-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
          >
            <CloseIcon />
          </Link>
          <p dir="ltr" className="text-body-md tabular-nums text-text-secondary">
            {index + 1} / {steps.length}
          </p>
        </div>
        <ProgressBar value={index + 1} max={steps.length} label="התקדמות באימון" tone={isRest ? "volt" : "ember"} />
      </header>

      <main key={index} className="ff-fade-in relative z-10 flex flex-1 flex-col px-gutter pt-8 pb-6 lg:px-10">
        {error && (
          <p role="alert" className="mb-4 text-body-md text-ember">
            {error}
          </p>
        )}

        {isRest ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="font-heading text-body-lg font-semibold text-volt">מנוחה</p>
            <ProgressRing value={(remaining ?? 0) / Math.max(step.durationSec ?? 1, remaining ?? 1)} size={248} stroke={10} tone="volt">
              <span dir="ltr" className="font-heading text-[72px] font-bold leading-none tabular-nums">
                {clock(remaining ?? 0)}
              </span>
            </ProgressRing>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => adjustRest(-15)}>
                <span dir="ltr">−15</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => adjustRest(15)}>
                <span dir="ltr">+15</span>
              </Button>
            </div>
            {nextStep?.target && (
              <p className="text-body-md text-text-secondary">
                הבא: <span className="font-semibold text-text-primary">{nextStep.target.exercise?.nameHe ?? "תרגיל"}</span>
              </p>
            )}
          </div>
        ) : step.type === "timed_block" ? (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <div>
              <p className="text-body-md text-text-secondary">{[step.sectionTitle, BLOCK_LABELS[step.blockStyle] ?? step.blockStyle].filter(Boolean).join(" · ")}</p>
              <p dir="ltr" className="mt-2 text-start font-heading text-[88px] font-bold leading-none tabular-nums text-ember">
                {remaining !== null ? clock(remaining) : step.durationSec ? clock(step.durationSec) : `${step.roundCount ?? 1}×`}
              </p>
              <Meta
                className="mt-3"
                items={[
                  step.capSec !== null && `תקרת זמן ${formatSeconds(step.capSec)}`,
                  step.blockStyle === "emom" && step.intervalSec ? `סיבוב חדש כל ${formatSeconds(step.intervalSec)}` : null,
                  step.roundCount !== null && step.durationSec === null ? `${step.roundCount} סבבים` : null,
                ]}
              />
            </div>
            <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-surface-raised">
              {(step.targets ?? []).map((t, i) => (
                <li key={i} className="px-4 py-3.5">
                  <p className="font-heading text-body-lg font-bold">{t.exercise?.nameHe ?? "תרגיל"}</p>
                  <p className="text-body-md text-text-secondary">{[targetHeadline(t), ...targetDetails(t)].join(" · ")}</p>
                </li>
              ))}
            </ul>
            {step.blockNotes && <p className="text-body-md text-text-secondary">{step.blockNotes}</p>}
          </div>
        ) : (
          target &&
          parts && (
            <div className="flex flex-1 flex-col justify-center gap-6">
              <div>
                <p className="text-body-md text-text-secondary">{where.filter(Boolean).join(" · ")}</p>
                <h2 className="mt-1 font-heading text-[32px] font-bold leading-10">{target.exercise?.nameHe ?? "תרגיל"}</h2>
              </div>

              <div className="flex items-baseline gap-3">
                <span dir="ltr" className="font-heading text-[88px] font-bold leading-none tabular-nums text-ember">
                  {remaining !== null ? clock(remaining) : parts.value}
                </span>
                {parts.unit && remaining === null && <span className="font-heading text-headline-sm font-medium text-text-secondary">{parts.unit}</span>}
              </div>

              {(targetDetails(target).length > 0 || target.zone !== null) && (
                <div>
                  <Meta items={targetDetails(target)} />
                  {target.zone !== null && <p className="mt-1 text-label-md text-text-muted">{ZONE_HINT}</p>}
                </div>
              )}

              {(target.notesHe || step.blockNotes || target.exercise?.cuesHe) && (
                <div className="flex flex-col gap-2 text-body-md text-text-secondary">
                  {target.notesHe && <p>{target.notesHe}</p>}
                  {step.blockNotes && <p>{step.blockNotes}</p>}
                  {target.exercise?.cuesHe && <p className="rounded-xl bg-surface-raised p-3.5">{target.exercise.cuesHe}</p>}
                </div>
              )}
              {target.exercise?.youtubeId && <Video youtubeId={target.exercise.youtubeId} title={target.exercise.nameHe} />}
            </div>
          )
        )}
      </main>

      <footer className="relative z-20 flex items-center gap-3 bg-canvas/95 px-gutter pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)] lg:px-10">
        <Button variant="ghost" size="lg" disabled={index === 0} onClick={() => goTo(steps, index - 1)} aria-label="לשלב הקודם">
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
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-gutter pt-[calc(env(safe-area-inset-top)+24px)] lg:max-w-3xl lg:px-10" role="status" aria-label="טוען את האימון">
      <div className="flex items-center justify-between">
        <Skeleton className="size-10 !rounded-xl" />
        <Skeleton className="h-4 w-14 !rounded-md" />
      </div>
      <Skeleton className="h-1.5 w-full !rounded-full" />
      <Skeleton className="mt-8 h-4 w-32 !rounded-md" />
      <Skeleton className="h-10 w-3/4 !rounded-lg" />
      <Skeleton className="h-20 w-48 !rounded-xl" />
    </div>
  );
}
