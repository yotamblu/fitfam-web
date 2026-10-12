"use client";

import { useEffect, useRef, useState } from "react";
import { api, describeError, type CustomerExercise } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { MEASURE_LABELS, SPORT_LABELS } from "@/lib/training";
import { CheckIcon, ChevronRightIcon } from "./icons";
import type { Theme } from "./RoadmapScenery";
import { useVenueTint } from "./StackShell";
import { Portal, Skeleton } from "./ui";
import VenueBackdrop from "./VenueBackdrop";
import Video from "./Video";

/**
 * One exercise explained, on top of whatever page is open (the workout page or the guided player), without leaving it:
 * what it is, how to do it step by step, what to watch for, which muscles and equipment, and the video when there is
 * one. It wears the venue of the workout it was opened from. The back button (or the browser's back, or Escape) closes
 * it and the page underneath is exactly as it was.
 */
export default function ExerciseSheet({ exerciseId, theme = null, onClose }: { exerciseId: string; theme?: Theme | null; onClose: () => void }) {
  const [exercise, setExercise] = useState<CustomerExercise | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useVenueTint(theme);

  useEffect(() => {
    let cancelled = false;
    api
      .exercise(exerciseId)
      .then((e) => {
        if (!cancelled) setExercise(e);
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  // the browser's back button (or an edge swipe in the installed app) closes the sheet instead of leaving the page
  useEffect(() => {
    window.history.pushState({ ffExerciseSheet: true }, "");
    const onPop = () => closeRef.current();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.history.back();
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);
    // stop the page underneath from scrolling while the sheet is open
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, []);

  const back = () => {
    sfx.back();
    window.history.back();
  };

  const lines = (text: string | null | undefined) =>
    (text ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  const steps = lines(exercise?.descriptionHe);
  const cues = lines(exercise?.cuesHe);
  const accent = theme?.accent ?? "var(--color-ember)";

  const facts: { label: string; value: string }[] = [];
  if (exercise) {
    if (exercise.muscleGroups.length > 0) facts.push({ label: "שרירים עיקריים", value: exercise.muscleGroups.join(" · ") });
    if (exercise.equipment.length > 0) facts.push({ label: "ציוד", value: exercise.equipment.join(" · ") });
    facts.push({ label: "מודדים לפי", value: MEASURE_LABELS[exercise.measure] ?? exercise.measure });
    facts.push({ label: "ענף", value: SPORT_LABELS[exercise.sport] });
  }
  const empty = !!exercise && steps.length === 0 && cues.length === 0 && !exercise.youtubeId;

  return (
    <Portal>
      {theme && <VenueBackdrop theme={theme} className="z-[64]" />}
      <div
        className={`ff-slide-in fixed inset-0 z-[65] overflow-y-auto overflow-x-hidden ${theme ? "" : "bg-canvas"}`}
        role="dialog"
        aria-modal="true"
        aria-label={exercise?.nameHe ?? "הסבר על התרגיל"}
      >
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-gutter pb-[calc(env(safe-area-inset-bottom)+40px)] lg:max-w-3xl lg:px-10">
          <header className="flex items-center gap-2 pt-[calc(env(safe-area-inset-top)+14px)] pb-3 lg:pt-8">
            <button
              type="button"
              onClick={back}
              className="-ms-2 flex h-10 items-center gap-1 rounded-xl px-2 text-body-md font-semibold text-text-primary/90 transition-colors hover:bg-white/[0.08]"
            >
              <ChevronRightIcon className="size-5" />
              חזרה
            </button>
          </header>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-ember/10 p-4 text-body-md text-ember">
              {error}
            </p>
          )}

          {!exercise && !error && (
            <div className="mt-2 flex flex-col gap-4" role="status" aria-label="טוען את התרגיל">
              <Skeleton className="h-4 w-28 !rounded-md" />
              <Skeleton className="h-12 w-2/3 !rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              <Skeleton className="h-40" />
            </div>
          )}

          {exercise && (
            <article className="flex flex-col gap-7 pt-2">
              <header className="ff-rise-in">
                <p className="text-body-md font-semibold" style={{ color: accent }}>
                  {SPORT_LABELS[exercise.sport]}
                </p>
                <h1 className="mt-1 font-heading text-[36px] font-bold leading-[44px] lg:text-[48px] lg:leading-[56px]">{exercise.nameHe}</h1>
              </header>

              {exercise.youtubeId && (
                <div className="ff-rise-in [animation-delay:60ms]">
                  <Video youtubeId={exercise.youtubeId} title={exercise.nameHe} />
                </div>
              )}

              <section className="ff-rise-in grid grid-cols-2 gap-3 [animation-delay:90ms]" aria-label="פרטי התרגיל">
                {facts.map((fact, i) => (
                  <div key={fact.label} className={`rounded-2xl bg-surface-raised p-4 ${facts.length % 2 === 1 && i === facts.length - 1 ? "col-span-2" : ""}`}>
                    <p className="text-label-md text-text-secondary">{fact.label}</p>
                    <p className="mt-1 font-heading text-body-lg font-bold">{fact.value}</p>
                  </div>
                ))}
              </section>

              {steps.length > 0 && (
                <section className="ff-rise-in flex flex-col gap-3 [animation-delay:130ms]">
                  <h2 className="font-heading text-headline-sm font-bold">איך מבצעים</h2>
                  {steps.length === 1 ? (
                    <p className="rounded-2xl bg-surface-raised p-4 text-body-lg leading-7 text-text-secondary">{steps[0]}</p>
                  ) : (
                    <ol className="flex flex-col gap-3 rounded-2xl bg-surface-raised p-4">
                      {steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full font-heading text-body-md font-bold text-canvas" style={{ backgroundColor: accent }}>
                            {i + 1}
                          </span>
                          <span className="pt-0.5 text-body-lg leading-7 text-text-primary">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              )}

              {cues.length > 0 && (
                <section className="ff-rise-in flex flex-col gap-3 [animation-delay:170ms]">
                  <h2 className="font-heading text-headline-sm font-bold">דגשים</h2>
                  <ul className="flex flex-col gap-3 rounded-2xl bg-surface-raised p-4">
                    {cues.map((cue, i) => (
                      <li key={i} className="flex gap-3">
                        <CheckIcon className="mt-1 size-5 shrink-0 text-volt" />
                        <span className="text-body-lg leading-7 text-text-secondary">{cue}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {empty && <p className="rounded-2xl bg-surface-raised p-4 text-body-md text-text-muted">עדיין אין הסבר מפורט לתרגיל הזה. המאמנים מוסיפים אותו בקרוב.</p>}
            </article>
          )}
        </div>
      </div>
    </Portal>
  );
}
