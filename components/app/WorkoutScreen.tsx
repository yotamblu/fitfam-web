"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, describeError, type AttemptResult, type CustomerWorkout, type Roadmap, type Step, type Stats } from "@/lib/api";
import { sfx } from "@/lib/sfx";
import { FINISH_FLAG, SPORT_LABELS, buildPreview, nextUp } from "@/lib/training";
import Button, { buttonClasses } from "../ui/Button";
import Celebration, { type Reward } from "./Celebration";
import ExerciseSheet from "./ExerciseSheet";
import { CheckIcon, ChevronLeftIcon, PlayIcon } from "./icons";
import { Card, Meta, RowList } from "./primitives";
import { themeForWorkout, type Theme } from "./RoadmapScenery";
import { useSession } from "./Session";
import StackShell from "./StackShell";
import { Skeleton } from "./ui";
import Video from "./Video";

type Outcome = { kind: "completed"; roadmap: Roadmap; reward: Reward } | { kind: "challenge"; result: AttemptResult; reward: Reward };

/** One workout: read it, play it with the guide, mark it done; or, for a level challenge, say whether you passed. A finished workout can be done again. */
export default function WorkoutScreen() {
  const id = String(useParams<{ id: string }>().id);
  const router = useRouter();
  const { stats, reloadPlans, reloadStats } = useSession();
  const statsRef = useRef<Stats | null>(stats);
  useEffect(() => {
    statsRef.current = stats;
  });

  const [data, setData] = useState<{ workout: CustomerWorkout; steps: Step[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const closeExercise = useCallback(() => setExerciseId(null), []);

  /** Works out what the action earned: the points gained, and whether the account levelled up. */
  const rewardAfter = async (): Promise<Reward> => {
    const before = statsRef.current;
    const [after] = await Promise.all([reloadStats(), reloadPlans()]);
    return {
      xpGained: before && after ? Math.max(0, after.xp - before.xp) : 0,
      before,
      after,
      levelUp: before && after && after.level > before.level ? after.level : null,
    };
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.workout(id), api.steps(id)])
      .then(async ([workout, steps]) => {
        if (cancelled) return;
        setData({ workout, steps: steps.steps });
        // arriving from the end of the guided player: finish the workout now and show the reward
        let finishing = false;
        try {
          finishing = window.sessionStorage.getItem(FINISH_FLAG) === id;
          if (finishing) window.sessionStorage.removeItem(FINISH_FLAG);
        } catch {
          // no session storage: the customer can still tap the finish button
        }
        if (finishing && workout.state !== "done" && workout.type !== "challenge") {
          setBusy(true);
          try {
            const roadmap = await api.complete(id);
            const reward = await rewardAfter();
            if (!cancelled) setOutcome({ kind: "completed", roadmap, reward });
          } catch (e) {
            if (!cancelled) setError(describeError(e));
          } finally {
            if (!cancelled) setBusy(false);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
    // loaded once per workout; the reward helper reads the latest stats from a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const run = async (action: () => Promise<{ outcome: (reward: Reward) => Outcome }>) => {
    setBusy(true);
    setError(null);
    try {
      const done = await action();
      setOutcome(done.outcome(await rewardAfter()));
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const workout = data?.workout ?? null;
  const theme = useMemo(() => (workout ? themeForWorkout(workout) : null), [workout]);

  if (outcome) return <OutcomeView outcome={outcome} theme={theme} onBack={() => router.replace("/home")} />;

  const isChallenge = workout?.type === "challenge";
  const done = workout?.state === "done";
  const preview = data ? buildPreview(data.steps) : [];
  const resuming = (workout?.resumeStep ?? 0) > 0;
  const points = stats ? (isChallenge ? stats.rewards.challenge : stats.rewards.workout) : null;

  return (
    <StackShell title={workout?.titleHe ?? "אימון"} backHref="/roadmap" backLabel="למסלול" theme={theme}>
      {error && (
        <p role="alert" className="ff-fade-in rounded-xl bg-ember/10 p-4 text-body-md text-ember">
          {error}
        </p>
      )}

      {!workout && !error && <WorkoutSkeleton />}

      {workout && (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-6">
            <section className="ff-rise-in">
              <Meta items={[isChallenge ? "אתגר מעבר רמה" : SPORT_LABELS[workout.sport], workout.estMinutes !== null && `${workout.estMinutes} דק׳`, done && "הושלם"]} />
              <h2 className="mt-2 font-heading text-[30px] font-bold leading-10 [text-shadow:0_2px_16px_rgba(0,0,0,0.55)] lg:text-[40px] lg:leading-[48px]">{workout.titleHe ?? "אימון"}</h2>
              {workout.descriptionHe && <p className="mt-2 text-body-lg text-text-secondary">{workout.descriptionHe}</p>}
            </section>

            {isChallenge && workout.goalHe && (
              <Card className="ff-rise-in border-s-4 border-ember p-5 [animation-delay:60ms]">
                <p className="text-label-md font-semibold text-ember">המטרה</p>
                <p className="mt-1 font-heading text-headline-sm font-bold">{workout.goalHe}</p>
              </Card>
            )}

            <section className="flex flex-col gap-6" aria-label="תכנית האימון">
              {preview.map((section, si) => (
                <div key={si} className="flex flex-col gap-3">
                  {section.title && <h3 className="font-heading text-body-lg font-bold">{section.title}</h3>}
                  <RowList>
                    {section.rows.map((row, ri) => (
                      <li key={row.key} className="ff-slide-in" style={{ animationDelay: `${Math.min(ri, 4) * 40}ms` }}>
                        {row.exercises.length === 1 ? (
                          // one exercise: the whole row opens its explanation
                          <button
                            type="button"
                            onClick={() => setExerciseId(row.exercises[0].id)}
                            aria-label={`הסבר על ${row.name}`}
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-white/[0.04] active:bg-white/[0.07]"
                          >
                            <span className="flex min-w-0 flex-1 flex-col gap-1">
                              <span className="font-heading text-body-lg font-bold">{row.name}</span>
                              <span className="text-body-md text-text-secondary">{row.summary}</span>
                            </span>
                            <ChevronLeftIcon className="size-5 shrink-0 text-text-muted" />
                          </button>
                        ) : (
                          <div className="flex flex-col gap-1 px-4 py-3.5">
                            <span className="font-heading text-body-lg font-bold">{row.name}</span>
                            <span className="text-body-md text-text-secondary">{row.summary}</span>
                            {row.exercises.length > 1 && (
                              <span className="mt-1 flex flex-wrap gap-2">
                                {row.exercises.map((e) => (
                                  <button key={e.id} type="button" onClick={() => setExerciseId(e.id)} className="rounded-lg bg-white/[0.07] px-3 py-1.5 text-body-md font-semibold text-info transition-colors hover:bg-white/[0.11]">
                                    {e.name}
                                  </button>
                                ))}
                              </span>
                            )}
                          </div>
                        )}
                        {row.youtubeId && (
                          <div className="px-4 pb-3.5">
                            <Video youtubeId={row.youtubeId} title={row.name} />
                          </div>
                        )}
                      </li>
                    ))}
                  </RowList>
                </div>
              ))}
              {preview.length === 0 && <p className="text-body-md text-text-muted">האימון עוד ריק.</p>}
            </section>
          </div>

          <div className="sticky bottom-0 z-20 -mx-gutter flex flex-col gap-3 bg-canvas/95 px-gutter py-4 backdrop-blur-xl lg:static lg:top-8 lg:mx-0 lg:rounded-2xl lg:bg-surface-raised lg:p-5 lg:sticky lg:bottom-auto">
            {done ? (
              <>
                <p className="text-body-md text-text-secondary">הושלם. אפשר לעשות אותו שוב לתרגול, בלי נקודות נוספות.</p>
                <Link href={`/workout/${id}/play`} className={buttonClasses({ size: "lg", fullWidth: true })}>
                  <PlayIcon className="size-4" />
                  לעשות שוב בליווי
                </Link>
              </>
            ) : (
              <>
                {points !== null && (
                  <p className="hidden items-baseline justify-between lg:flex">
                    <span className="text-body-md text-text-secondary">פרס על האימון</span>
                    <span dir="ltr" className="font-heading text-headline-sm font-bold tabular-nums text-volt">
                      +{points}
                    </span>
                  </p>
                )}
                <Link href={`/workout/${id}/play`} className={buttonClasses({ size: "lg", fullWidth: true, variant: isChallenge ? "secondary" : "primary" })}>
                  <PlayIcon className="size-4" />
                  {resuming ? "להמשיך בליווי" : "התחלה בליווי"}
                </Link>

                {isChallenge ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="volt"
                      size="lg"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const result = await api.attemptChallenge(id, true);
                          return { outcome: (reward) => ({ kind: "challenge", result, reward }) };
                        })
                      }
                    >
                      עברתי
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const result = await api.attemptChallenge(id, false);
                          return { outcome: (reward) => ({ kind: "challenge", result, reward }) };
                        })
                      }
                    >
                      עוד לא
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const roadmap = await api.complete(id);
                        return { outcome: (reward) => ({ kind: "completed", roadmap, reward }) };
                      })
                    }
                  >
                    <CheckIcon className="size-4" />
                    {busy ? "שומר..." : "סימנתי שסיימתי"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {exerciseId && <ExerciseSheet exerciseId={exerciseId} theme={theme} onClose={closeExercise} />}
    </StackShell>
  );
}

function WorkoutSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12" role="status" aria-label="טוען את האימון">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-40 !rounded-md" />
        <Skeleton className="h-10 w-3/4 !rounded-lg" />
        <Skeleton className="h-4 w-1/2 !rounded-md" />
        <Skeleton className="mt-2 h-56" />
      </div>
      <Skeleton className="hidden h-40 lg:block" />
    </div>
  );
}

/** After a challenge that did not pass: a soft sound and an open door, nothing punishing. */
function NotYet() {
  useEffect(() => {
    sfx.notYet();
  }, []);
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-5 pt-10 text-center lg:pt-16">
      <h2 className="ff-rise-in font-heading text-[30px] font-bold leading-10">עוד לא עברתם</h2>
      <p className="ff-rise-in text-body-lg text-text-secondary [animation-delay:100ms]">אפשר לנסות שוב מתי שרוצים. אין הגבלה.</p>
      <Link href="/roadmap" className={`${buttonClasses({ size: "lg", fullWidth: true, variant: "secondary" })} ff-rise-in [animation-delay:200ms]`}>
        חזרה למסלול
      </Link>
    </section>
  );
}

export function OutcomeView({ outcome, theme = null, onBack }: { outcome: Outcome; theme?: Theme | null; onBack: () => void }) {
  if (outcome.kind === "completed") {
    const next = nextUp(outcome.roadmap);
    return (
      <StackShell title="האימון הושלם" backHref="/home" backLabel="לבית" theme={theme}>
        <Celebration title="האימון הושלם" reward={outcome.reward}>
          {next ? (
            <>
              <p className="text-body-md text-text-secondary">
                הבא בתור: <span className="font-semibold text-text-primary">{next.workout.titleHe ?? "אימון"}</span>
              </p>
              <Link href={`/workout/${next.workout.id}`} className={buttonClasses({ size: "lg", fullWidth: true })}>
                לאימון הבא
              </Link>
            </>
          ) : (
            <p className="text-body-md text-text-secondary">עוד לא הוספנו את האימון הבא. נעדכן אתכם.</p>
          )}
          <Button variant="ghost" onClick={onBack}>
            חזרה לבית
          </Button>
        </Celebration>
      </StackShell>
    );
  }

  const { result, reward } = outcome;
  return (
    <StackShell title="אתגר מעבר רמה" backHref="/home" backLabel="לבית" theme={theme}>
      {result.passed ? (
        <Celebration
          challenge
          title={result.planCompleted ? "סיימתם את כל המסלול" : "עברתם רמה"}
          subtitle={result.planCompleted ? undefined : `עכשיו אתם ברמה ${result.currentLevelNumber}`}
          reward={reward}
        >
          <Link href="/roadmap" className={buttonClasses({ size: "lg", fullWidth: true })}>
            למסלול
          </Link>
        </Celebration>
      ) : (
        <NotYet />
      )}
    </StackShell>
  );
}
