"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, describeError, type AttemptResult, type CustomerWorkout, type Roadmap, type Step } from "@/lib/api";
import { rankTitle } from "@/lib/gamify";
import { SPORT_LABELS, buildPreview, nextUp } from "@/lib/training";
import Button, { buttonClasses } from "../ui/Button";
import { CheckIcon, FlagIcon, PlayIcon } from "./icons";
import { Card, Meta, RowList } from "./primitives";
import { useSession } from "./Session";
import StackShell from "./StackShell";
import { Confetti, CountUp, Skeleton } from "./ui";
import Video from "./Video";

type Reward = { xpGained: number; levelUp: number | null; weeklyStreak: number | null };
type Outcome =
  | { kind: "completed"; roadmap: Roadmap; reward: Reward }
  | { kind: "challenge"; result: AttemptResult; reward: Reward };

/** One workout: read it, play it with the guide, mark it done; or, for a level challenge, say whether you passed. */
export default function WorkoutScreen() {
  const id = String(useParams<{ id: string }>().id);
  const router = useRouter();
  const { stats, reloadPlans, reloadStats } = useSession();

  const [data, setData] = useState<{ workout: CustomerWorkout; steps: Step[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.workout(id), api.steps(id)])
      .then(([workout, steps]) => {
        if (!cancelled) setData({ workout, steps: steps.steps });
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Runs the action, then works out what it earned: the points gained and whether the account levelled up. */
  const run = async (action: () => Promise<{ outcome: (reward: Reward) => Outcome }>) => {
    setBusy(true);
    setError(null);
    try {
      const done = await action();
      const [fresh] = await Promise.all([reloadStats(), reloadPlans()]);
      const reward: Reward = {
        xpGained: stats && fresh ? Math.max(0, fresh.xp - stats.xp) : 0,
        levelUp: stats && fresh && fresh.level > stats.level ? fresh.level : null,
        weeklyStreak: fresh?.weeklyStreak ?? null,
      };
      setOutcome(done.outcome(reward));
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  if (outcome) return <OutcomeView outcome={outcome} onBack={() => router.replace("/home")} />;

  const workout = data?.workout ?? null;
  const isChallenge = workout?.type === "challenge";
  const done = workout?.state === "done";
  const preview = data ? buildPreview(data.steps) : [];
  const resuming = (workout?.resumeStep ?? 0) > 0;
  const points = stats ? (isChallenge ? stats.rewards.challenge : stats.rewards.workout) : null;

  return (
    <StackShell title={workout?.titleHe ?? "אימון"} backHref="/roadmap" backLabel="למסלול">
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
              <Meta
                items={[
                  isChallenge ? "אתגר מעבר רמה" : SPORT_LABELS[workout.sport],
                  workout.estMinutes !== null && `${workout.estMinutes} דק׳`,
                  done && "הושלם",
                ]}
              />
              <h2 className="mt-2 font-heading text-[30px] font-bold leading-10 lg:text-[40px] lg:leading-[48px]">{workout.titleHe ?? "אימון"}</h2>
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
                      <li key={row.key} className="ff-slide-in flex flex-col gap-1 px-4 py-3.5" style={{ animationDelay: `${Math.min(ri, 4) * 40}ms` }}>
                        <span className="font-heading text-body-lg font-bold">{row.name}</span>
                        <span className="text-body-md text-text-secondary">{row.summary}</span>
                        {row.youtubeId && (
                          <div className="mt-2">
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

          {done ? (
            <p className="rounded-xl bg-volt/10 p-4 text-center text-body-md text-volt lg:sticky lg:top-8">סיימתם את האימון הזה. אפשר לקרוא אותו, אבל לא לעשות אותו שוב.</p>
          ) : (
            <div className="sticky bottom-0 z-20 -mx-gutter flex flex-col gap-3 bg-canvas/95 px-gutter py-4 backdrop-blur-xl lg:static lg:top-8 lg:mx-0 lg:rounded-2xl lg:bg-surface-raised lg:p-5 lg:sticky lg:bottom-auto">
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
            </div>
          )}
        </div>
      )}
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

/** What the workout earned: a quiet summary, with the points, a level-up line when there is one, and the next step. */
function RewardRows({ reward }: { reward: Reward }) {
  return (
    <div className="flex w-full flex-col divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-surface-raised text-start">
      {reward.xpGained > 0 && (
        <p className="ff-rise-in flex items-baseline justify-between px-4 py-3.5 [animation-delay:150ms]">
          <span className="text-body-md text-text-secondary">נקודות</span>
          <span className="flex font-heading text-headline-sm font-bold text-volt">
            +<CountUp value={reward.xpGained} />
          </span>
        </p>
      )}
      {reward.levelUp !== null && (
        <p className="ff-rise-in flex items-baseline justify-between px-4 py-3.5 [animation-delay:250ms]">
          <span className="text-body-md text-text-secondary">רמה חדשה</span>
          <span className="font-heading text-body-lg font-bold">
            {reward.levelUp} · {rankTitle(reward.levelUp)}
          </span>
        </p>
      )}
      {reward.weeklyStreak !== null && reward.weeklyStreak > 0 && (
        <p className="ff-rise-in flex items-baseline justify-between px-4 py-3.5 [animation-delay:350ms]">
          <span className="text-body-md text-text-secondary">רצף שבועי</span>
          <span className="font-heading text-body-lg font-bold">{reward.weeklyStreak} שבועות</span>
        </p>
      )}
    </div>
  );
}

function OutcomeView({ outcome, onBack }: { outcome: Outcome; onBack: () => void }) {
  if (outcome.kind === "completed") {
    const next = nextUp(outcome.roadmap);
    return (
      <StackShell title="האימון הושלם" backHref="/home" backLabel="לבית">
        {outcome.reward.levelUp !== null && <Confetti />}
        <section className="mx-auto flex w-full max-w-md flex-col items-center gap-5 pt-10 text-center lg:pt-16">
          <span className="ff-pop-in flex size-16 items-center justify-center rounded-full bg-volt text-canvas">
            <CheckIcon className="size-8" />
          </span>
          <h2 className="ff-rise-in font-heading text-[30px] font-bold leading-10 [animation-delay:80ms]">האימון הושלם</h2>
          <RewardRows reward={outcome.reward} />
          {next ? (
            <div className="ff-rise-in flex w-full flex-col gap-3 [animation-delay:450ms]">
              <p className="text-body-md text-text-secondary">
                הבא בתור: <span className="font-semibold text-text-primary">{next.workout.titleHe ?? "אימון"}</span>
              </p>
              <Link href={`/workout/${next.workout.id}`} className={buttonClasses({ size: "lg", fullWidth: true })}>
                לאימון הבא
              </Link>
            </div>
          ) : (
            <p className="text-body-md text-text-secondary">עוד לא הוספנו את האימון הבא. נעדכן אתכם.</p>
          )}
          <Button variant="ghost" onClick={onBack}>
            חזרה לבית
          </Button>
        </section>
      </StackShell>
    );
  }

  const { result, reward } = outcome;
  return (
    <StackShell title="אתגר מעבר רמה" backHref="/home" backLabel="לבית">
      {result.passed && <Confetti pieces={48} />}
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-5 pt-10 text-center lg:pt-16">
        {result.passed ? (
          <>
            <span className="ff-pop-in flex size-16 items-center justify-center rounded-full bg-volt text-canvas">
              <FlagIcon className="size-8" />
            </span>
            <h2 className="ff-rise-in font-heading text-[30px] font-bold leading-10 [animation-delay:80ms]">{result.planCompleted ? "סיימתם את כל המסלול" : "עברתם רמה"}</h2>
            {!result.planCompleted && (
              <p className="ff-rise-in text-body-lg text-text-secondary [animation-delay:150ms]">
                עכשיו אתם ברמה <span dir="ltr" className="font-bold text-text-primary">{result.currentLevelNumber}</span>
              </p>
            )}
            <RewardRows reward={reward} />
            <Link href="/roadmap" className={`${buttonClasses({ size: "lg", fullWidth: true })} ff-rise-in [animation-delay:450ms]`}>
              למסלול
            </Link>
          </>
        ) : (
          <>
            <h2 className="ff-rise-in font-heading text-[30px] font-bold leading-10">עוד לא עברתם</h2>
            <p className="ff-rise-in text-body-lg text-text-secondary [animation-delay:100ms]">אפשר לנסות שוב מתי שרוצים. אין הגבלה.</p>
            <Link href="/roadmap" className={`${buttonClasses({ size: "lg", fullWidth: true, variant: "secondary" })} ff-rise-in [animation-delay:200ms]`}>
              חזרה למסלול
            </Link>
          </>
        )}
      </section>
    </StackShell>
  );
}
