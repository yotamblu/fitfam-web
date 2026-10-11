"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, describeError, type AttemptResult, type CustomerWorkout, type Roadmap, type Step } from "@/lib/api";
import { rankTitle } from "@/lib/gamify";
import { SPORT_LABELS, buildPreview, nextUp } from "@/lib/training";
import Button, { buttonClasses } from "../ui/Button";
import Chip from "../ui/Chip";
import { BoltIcon, CheckIcon, FlagIcon, FlameIcon, PlayIcon, TrophyIcon } from "./icons";
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
        <p role="alert" className="ff-fade-in rounded-xl border border-ember/40 bg-ember/10 p-4 text-body-md text-ember">
          {error}
        </p>
      )}

      {!workout && !error && <WorkoutSkeleton />}

      {workout && (
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
          <div className="flex min-w-0 flex-col gap-5">
            <section className="ff-rise-in flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {isChallenge && (
                  <Chip tone="ember">
                    <FlagIcon className="size-3.5" />
                    אתגר מעבר רמה
                  </Chip>
                )}
                <Chip tone="info">{SPORT_LABELS[workout.sport]}</Chip>
                {workout.estMinutes !== null && <Chip>{workout.estMinutes} דק׳</Chip>}
                {done && (
                  <Chip tone="volt">
                    <CheckIcon className="size-3.5" />
                    הושלם
                  </Chip>
                )}
              </div>
              <h2 className="font-heading text-display-hero-mobile font-extrabold lg:text-display-hero">{workout.titleHe ?? "אימון"}</h2>
              {workout.descriptionHe && <p className="text-body-lg text-text-secondary">{workout.descriptionHe}</p>}
            </section>

            {isChallenge && workout.goalHe && (
              <section className="ff-pop-in rounded-2xl border border-ember/40 bg-ember/10 p-5 [animation-delay:120ms]">
                <p className="text-label-md font-semibold text-ember">המטרה</p>
                <p className="mt-1 font-heading text-headline-md font-bold">{workout.goalHe}</p>
              </section>
            )}

            <section className="flex flex-col gap-5" aria-label="תכנית האימון">
              {preview.map((section, si) => (
                <div key={si} className="flex flex-col gap-2">
                  {section.title && <h3 className="font-heading text-headline-sm font-bold">{section.title}</h3>}
                  <ul className="flex flex-col gap-2">
                    {section.rows.map((row, ri) => (
                      <li
                        key={row.key}
                        className="ff-slide-in flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3.5"
                        style={{ animationDelay: `${Math.min(si * 4 + ri, 10) * 55 + 150}ms` }}
                      >
                        <span className="font-heading text-body-lg font-bold">{row.name}</span>
                        <span className="text-body-md text-text-secondary">{row.summary}</span>
                        {row.youtubeId && <Video youtubeId={row.youtubeId} title={row.name} />}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {preview.length === 0 && <p className="text-body-md text-text-muted">האימון עוד ריק.</p>}
            </section>
          </div>

          {done ? (
            <p className="ff-pop-in rounded-xl border border-volt/30 bg-volt/10 p-4 text-center text-body-md text-volt lg:sticky lg:top-8">
              סיימתם את האימון הזה. אפשר לקרוא אותו, אבל לא לעשות אותו שוב.
            </p>
          ) : (
            <div className="sticky bottom-0 z-20 -mx-gutter flex flex-col gap-3 border-t border-border bg-canvas/90 px-gutter py-4 backdrop-blur-xl lg:static lg:top-8 lg:mx-0 lg:rounded-2xl lg:border lg:bg-surface-raised lg:p-5 lg:sticky lg:bottom-auto">
              {points !== null && (
                <p className="hidden items-center justify-between lg:flex">
                  <span className="text-body-md text-text-secondary">פרס על האימון</span>
                  <span className="flex items-center gap-1 font-heading text-headline-sm font-extrabold text-volt">
                    <BoltIcon className="size-5" />
                    <span dir="ltr">+{points}</span>
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
                    עברתי!
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
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10" role="status" aria-label="טוען את האימון">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 !rounded-md" />
          <Skeleton className="h-7 w-16 !rounded-md" />
        </div>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <Skeleton className="hidden h-44 lg:block" />
    </div>
  );
}

function RewardBadge({ reward }: { reward: Reward }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {reward.xpGained > 0 && (
        <p className="ff-pop-in flex items-center gap-2 rounded-full bg-volt/15 px-5 py-2 font-heading text-headline-md font-extrabold text-volt [animation-delay:350ms]">
          <BoltIcon className="size-6" />
          <span className="flex">
            +<CountUp value={reward.xpGained} />
          </span>
          <span className="text-body-lg">נקודות</span>
        </p>
      )}
      {reward.levelUp !== null && (
        <p className="ff-pop-in rounded-2xl border border-ember/50 bg-ember/10 px-5 py-3 font-heading text-headline-sm font-extrabold text-ember shadow-glow-ember [animation-delay:700ms]">
          עליתם לרמה {reward.levelUp} · {rankTitle(reward.levelUp)}
        </p>
      )}
      {reward.weeklyStreak !== null && reward.weeklyStreak > 0 && (
        <p className="ff-rise-in flex items-center gap-1.5 text-body-md text-text-secondary [animation-delay:900ms]">
          <FlameIcon className="ff-flame size-4 text-ember" />
          {reward.weeklyStreak} שבועות ברצף
        </p>
      )}
    </div>
  );
}

function OutcomeView({ outcome, onBack }: { outcome: Outcome; onBack: () => void }) {
  if (outcome.kind === "completed") {
    const next = nextUp(outcome.roadmap);
    return (
      <StackShell title="כל הכבוד" backHref="/home" backLabel="לבית">
        <Confetti />
        <section className="mx-auto flex w-full max-w-md flex-col items-center gap-5 pt-8 text-center lg:pt-16">
          <span className="ff-pop-in relative flex size-24 items-center justify-center rounded-full bg-volt text-canvas shadow-glow-volt">
            <span aria-hidden="true" className="ff-ring absolute inset-0 rounded-full border-2 border-volt" />
            <CheckIcon className="size-12" />
          </span>
          <h2 className="ff-rise-in font-heading text-display-hero-mobile font-extrabold [animation-delay:200ms] lg:text-display-hero">האימון הושלם!</h2>
          <RewardBadge reward={outcome.reward} />
          {next ? (
            <div className="ff-rise-in flex w-full flex-col gap-3 [animation-delay:1000ms]">
              <p className="text-body-lg text-text-secondary">
                הבא בתור: <span className="font-bold text-text-primary">{next.workout.titleHe ?? "אימון"}</span>
              </p>
              <Link href={`/workout/${next.workout.id}`} className={buttonClasses({ size: "lg", fullWidth: true })}>
                לאימון הבא
              </Link>
            </div>
          ) : (
            <p className="text-body-lg text-text-secondary">עוד לא הוספנו את האימון הבא. נעדכן אתכם.</p>
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
      {result.passed && <Confetti pieces={56} />}
      <section className="mx-auto flex w-full max-w-md flex-col items-center gap-5 pt-8 text-center lg:pt-16">
        {result.passed ? (
          <>
            <span className="ff-pop-in relative flex size-24 items-center justify-center rounded-full bg-volt text-canvas shadow-glow-volt">
              <span aria-hidden="true" className="ff-ring absolute inset-0 rounded-full border-2 border-volt" />
              {result.planCompleted ? <TrophyIcon className="size-12" /> : <FlagIcon className="size-12" />}
            </span>
            <h2 className="ff-rise-in font-heading text-display-hero-mobile font-extrabold [animation-delay:200ms] lg:text-display-hero">
              {result.planCompleted ? "סיימתם את כל המסלול!" : "עברתם רמה!"}
            </h2>
            {!result.planCompleted && (
              <p className="ff-rise-in text-body-lg text-text-secondary [animation-delay:350ms]">
                עכשיו אתם ברמה <span dir="ltr" className="font-bold text-text-primary">{result.currentLevelNumber}</span>.
              </p>
            )}
            <RewardBadge reward={reward} />
            <Link href="/roadmap" className={`${buttonClasses({ size: "lg", fullWidth: true })} ff-rise-in [animation-delay:1000ms]`}>
              למסלול
            </Link>
          </>
        ) : (
          <>
            <h2 className="ff-rise-in font-heading text-display-hero-mobile font-extrabold lg:text-display-hero">עוד לא, אבל כמעט</h2>
            <p className="ff-rise-in text-body-lg text-text-secondary [animation-delay:150ms]">אפשר לנסות שוב מתי שרוצים. אין הגבלה.</p>
            <Link href="/roadmap" className={`${buttonClasses({ size: "lg", fullWidth: true, variant: "secondary" })} ff-rise-in [animation-delay:300ms]`}>
              חזרה למסלול
            </Link>
          </>
        )}
      </section>
    </StackShell>
  );
}
