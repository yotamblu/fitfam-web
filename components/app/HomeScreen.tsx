"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, describeError, type Roadmap, type Stats } from "@/lib/api";
import { WEEKDAY_LETTERS, rankTitle, ratio } from "@/lib/gamify";
import { SPORT_LABELS, levelProgress, nextUp } from "@/lib/training";
import { buttonClasses } from "../ui/Button";
import Chip from "../ui/Chip";
import ProgressBar from "../ui/ProgressBar";
import { BoltIcon, CheckIcon, FlagIcon, FlameIcon, PlayIcon, TrophyIcon } from "./icons";
import { useSession } from "./Session";
import { CountUp, ProgressRing, Reveal, Skeleton } from "./ui";

/** Today: your player card, this week's streak, the next workout of each plan and how your last weeks went. */
export default function HomeScreen() {
  const { user, plans, stats } = useSession();
  const [roadmaps, setRoadmaps] = useState<Roadmap[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(plans.map((plan) => api.roadmap(plan.planSlug)))
      .then((result) => {
        if (!cancelled) setRoadmaps(result);
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [plans]);

  const firstName = (user.displayName ?? "").split(" ")[0];

  return (
    <>
      <section className="ff-rise-in">
        <p className="text-body-md text-text-secondary">מוכנים להתאמן?</p>
        <h1 className="font-heading text-headline-md font-extrabold lg:text-display-hero">
          שלום{firstName ? ` ${firstName}` : ""} <span className="inline-block origin-bottom-right animate-flicker">👋</span>
        </h1>
      </section>

      {error && (
        <p role="alert" className="ff-fade-in rounded-xl border border-ember/40 bg-ember/10 p-4 text-body-md text-ember">
          {error}
        </p>
      )}

      {plans.length === 0 ? (
        <NoPlans />
      ) : (
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
          {/* main column */}
          <div className="order-2 flex min-w-0 flex-col gap-5 lg:order-1">
            {!roadmaps && !error && <PlanSkeleton count={plans.length} />}
            {roadmaps && (
              <div className="flex flex-col gap-4">
                {roadmaps.map((roadmap, i) => (
                  <PlanCard key={roadmap.planSlug} roadmap={roadmap} compact={roadmaps.length > 1} reward={stats?.rewards} delay={i * 90} />
                ))}
              </div>
            )}
            {stats && <ActivityChart stats={stats} />}
            {roadmaps && roadmaps.length === 1 && <ComingUp roadmap={roadmaps[0]} />}
            {roadmaps && roadmaps.length === 1 && (
              <Reveal>
                <aside className="rounded-2xl border border-dashed border-border-emphasis bg-surface/60 p-4 text-center">
                  <p className="font-heading text-body-lg font-bold">רוצים עוד מסלול?</p>
                  <p className="mt-1 text-body-md text-text-secondary">אפשר לשלב עוד תוכנית לצד זו. דברו איתנו ונוסיף אותה.</p>
                </aside>
              </Reveal>
            )}
          </div>

          {/* side column: the game layer */}
          <div className="order-1 flex flex-col gap-4 lg:order-2 lg:sticky lg:top-8">
            {stats ? (
              <>
                <PlayerCard stats={stats} name={user.displayName ?? user.email} />
                <StreakCard stats={stats} />
              </>
            ) : (
              <>
                <Skeleton className="h-36" />
                <Skeleton className="h-44" />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NoPlans() {
  return (
    <section className="ff-pop-in flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-ember/15 text-ember">
        <TrophyIcon className="size-8" />
      </span>
      <p className="font-heading text-headline-sm font-bold">התוכנית שלכם בדרך</p>
      <p className="text-body-md text-text-secondary">עדיין לא שייכנו לכם תוכנית אימון. נעדכן ברגע שהיא מוכנה.</p>
    </section>
  );
}

function PlanSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="טוען את האימונים">
      {Array.from({ length: Math.max(1, count) }, (_, i) => (
        <Skeleton key={i} className="h-60" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

// ---------- the game layer ----------

export function PlayerCard({ stats, name }: { stats: Stats; name: string }) {
  const toNext = stats.xpForNextLevel - stats.xpIntoLevel;
  return (
    <section className="ff-rise-in relative overflow-hidden rounded-2xl border border-border-emphasis bg-surface-raised p-5">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -end-10 size-48 rounded-full bg-ember/25 blur-[70px]" />
      <div className="relative flex items-center gap-4">
        <ProgressRing value={ratio(stats.xpIntoLevel, stats.xpForNextLevel)} size={92} stroke={8}>
          <div className="text-center leading-none">
            <span className="block text-label-md text-text-secondary">רמה</span>
            <CountUp value={stats.level} className="font-heading text-headline-md font-extrabold" />
          </div>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-body-lg font-bold">{name}</p>
          <p className="font-heading text-headline-sm font-extrabold text-ember">{rankTitle(stats.level)}</p>
          <p className="mt-1 flex items-center gap-1 text-body-md text-text-secondary">
            <BoltIcon className="size-4 text-volt" />
            <CountUp value={stats.xp} className="font-bold text-text-primary" /> נקודות
          </p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-col gap-1.5">
        <ProgressBar value={stats.xpIntoLevel} max={stats.xpForNextLevel} label="התקדמות לרמה הבאה" tone="volt" />
        <p dir="rtl" className="text-label-md text-text-secondary">
          עוד <span dir="ltr" className="font-bold text-text-primary">{toNext}</span> נקודות לרמה {stats.level + 1}
        </p>
      </div>
    </section>
  );
}

export function StreakCard({ stats }: { stats: Stats }) {
  const left = Math.max(0, stats.weeklyGoal - stats.weekCount);
  const message =
    left === 0
      ? "הגעתם ליעד השבועי! כל אימון נוסף הוא בונוס 🔥"
      : stats.weekCount === 0
        ? "עוד לא התאמנתם השבוע. אימון אחד מספיק כדי להמשיך את הרצף."
        : `עוד ${left} ${left === 1 ? "אימון" : "אימונים"} ליעד השבועי`;
  return (
    <section className="ff-rise-in rounded-2xl border border-border bg-surface p-5 [animation-delay:90ms]">
      <div className="flex items-center gap-3">
        <span className={`flex size-12 items-center justify-center rounded-2xl ${stats.weeklyStreak > 0 ? "bg-ember/15 text-ember" : "bg-well text-text-muted"}`}>
          <FlameIcon className={`size-7 ${stats.weeklyStreak > 0 ? "ff-flame" : ""}`} />
        </span>
        <div>
          <p className="font-heading text-headline-md font-extrabold leading-none">
            <CountUp value={stats.weeklyStreak} /> <span className="text-body-lg font-bold text-text-secondary">שבועות ברצף</span>
          </p>
          <p className="mt-1 text-label-md text-text-muted">שבוע נחשב כשיש בו לפחות אימון אחד</p>
        </div>
      </div>

      <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="הימים השבוע">
        {stats.weekDays.map((active, i) => {
          const today = i === stats.todayIndex;
          return (
            <li key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={`ff-pop-in flex size-9 items-center justify-center rounded-full border text-canvas ${
                  active ? "border-volt bg-volt shadow-glow-volt" : today ? "border-ember bg-ember/10" : "border-border-emphasis bg-well"
                }`}
                style={{ animationDelay: `${200 + i * 70}ms` }}
              >
                {active && <CheckIcon className="size-4" />}
              </span>
              <span className={`text-label-md font-semibold ${today ? "text-ember" : "text-text-muted"}`}>{WEEKDAY_LETTERS[i]}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-col gap-1.5">
        <ProgressBar value={stats.weekCount} max={stats.weeklyGoal} label="יעד שבועי" tone={left === 0 ? "volt" : "ember"} />
        <p className="text-body-md text-text-secondary">{message}</p>
      </div>
    </section>
  );
}

function ActivityChart({ stats }: { stats: Stats }) {
  const peak = Math.max(stats.weeklyGoal, ...stats.recentWeeks, 1);
  return (
    <Reveal>
      <section className="rounded-2xl border border-border bg-surface p-5" aria-label="אימונים בשבועות האחרונים">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-headline-sm font-bold">השבועות האחרונים</h2>
          <Chip tone="volt">
            <CheckIcon className="size-3.5" />
            <span dir="ltr">{stats.totalWorkouts}</span> אימונים בסך הכול
          </Chip>
        </div>
        <ol className="mt-5 flex h-36 items-end gap-2 sm:gap-4" dir="ltr">
          {stats.recentWeeks.map((count, i) => {
            const isCurrent = i === stats.recentWeeks.length - 1;
            return (
              <li key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span dir="ltr" className="text-label-md font-bold tabular-nums text-text-secondary">
                  {count}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`ff-grow-y w-full rounded-t-lg ${isCurrent ? "bg-ember shadow-glow-ember" : count > 0 ? "bg-volt/80" : "bg-border-emphasis"}`}
                    style={{ height: `${Math.max(count === 0 ? 6 : 12, ratio(count, peak) * 100)}%`, animationDelay: `${i * 90}ms` }}
                  />
                </div>
                <span className="text-label-md text-text-muted">{isCurrent ? "השבוע" : `-${stats.recentWeeks.length - 1 - i}`}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </Reveal>
  );
}

// ---------- plans ----------

function PlanCard({ roadmap, compact, reward, delay }: { roadmap: Roadmap; compact: boolean; reward?: Stats["rewards"]; delay: number }) {
  const next = nextUp(roadmap);
  const progress = levelProgress(roadmap);

  if (roadmap.planCompleted) {
    return (
      <section className="ff-pop-in relative overflow-hidden rounded-2xl border border-volt/40 bg-surface-raised p-8 text-center shadow-glow-volt">
        <TrophyIcon className="ff-bob mx-auto size-12 text-volt" />
        <p className="mt-3 font-heading text-headline-md font-extrabold text-volt">סיימתם את {roadmap.planNameHe}!</p>
        <p className="mt-2 text-body-md text-text-secondary">עברתם את כל הרמות. אפשר לחזור לכל אימון בקריאה בלבד.</p>
        <Link href="/roadmap" className={`${buttonClasses({ variant: "secondary" })} mt-4`}>
          למסלול
        </Link>
      </section>
    );
  }

  const points = next ? (next.workout.type === "challenge" ? reward?.challenge : reward?.workout) : undefined;

  return (
    <section className="ff-rise-in group relative overflow-hidden rounded-2xl border border-border-emphasis bg-surface-raised p-5 sm:p-6" style={{ animationDelay: `${delay}ms` }}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-20 -start-16 size-64 rounded-full bg-ember/25 blur-[80px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -end-10 size-56 rounded-full bg-volt/10 blur-[80px]" />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="ember">{roadmap.planNameHe}</Chip>
            <Chip>{progress.levelName}</Chip>
          </div>
          {points !== undefined && (
            <span className="ff-pop-in flex items-center gap-1 rounded-full bg-volt/15 px-3 py-1 font-heading text-body-md font-extrabold text-volt [animation-delay:300ms]">
              <BoltIcon className="size-4" />
              <span dir="ltr">+{points}</span>
            </span>
          )}
        </div>

        {next ? (
          <>
            <div>
              <p className="flex items-center gap-1.5 text-label-md font-semibold text-text-secondary">
                {next.workout.type === "challenge" && <FlagIcon className="size-4 text-ember" />}
                {next.workout.type === "challenge" ? "אתגר מעבר רמה" : `אימון ${next.position} מתוך ${next.total}`}
              </p>
              <h2 className={`mt-1 font-heading font-extrabold ${compact ? "text-headline-md" : "text-display-hero-mobile sm:text-display-hero"}`}>
                {next.workout.titleHe ?? "אימון"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip tone="info">{SPORT_LABELS[next.workout.sport]}</Chip>
                {next.workout.estMinutes !== null && <Chip>{next.workout.estMinutes} דק׳</Chip>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <ProgressBar value={progress.done} max={progress.total} label="התקדמות ברמה" />
              <p className="text-label-md text-text-secondary">
                <span dir="ltr" className="font-bold text-text-primary">
                  {progress.done}/{progress.total}
                </span>{" "}
                אימונים הושלמו ברמה הזו
              </p>
            </div>
            <Link href={`/workout/${next.workout.id}`} className={`${buttonClasses({ size: "lg", fullWidth: true })} relative overflow-hidden`}>
              <PlayIcon className="size-4" />
              {next.workout.type === "challenge" ? "לאתגר" : "התחלת האימון"}
            </Link>
          </>
        ) : (
          <>
            <h2 className="font-heading text-headline-md font-extrabold">עוד מכינים לכם את האימונים</h2>
            <p className="text-body-md text-text-secondary">ברמה הזו עדיין אין אימון מוכן. תשובו בקרוב, או הציצו במסלול.</p>
            <Link href="/roadmap" className={buttonClasses({ variant: "secondary", fullWidth: true })}>
              למסלול
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

/** The next few workouts of the current level (locked ones are dimmed: the order is strict). */
function ComingUp({ roadmap }: { roadmap: Roadmap }) {
  const level = roadmap.levels.find((l) => l.levelNumber === roadmap.currentLevelNumber);
  if (!level) return null;
  const currentIndex = level.workouts.findIndex((w) => w.state === "current");
  const upcoming = level.workouts.slice(currentIndex + 1, currentIndex + 4);
  const lastDone = [...level.workouts].reverse().find((w) => w.state === "done");
  if (upcoming.length === 0 && !lastDone) return null;

  return (
    <Reveal>
      <section className="flex flex-col gap-2" aria-label="בהמשך">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-headline-sm font-bold">בהמשך</h2>
          <Link href="/roadmap" className="text-body-md font-semibold text-ember">
            כל המסלול
          </Link>
        </div>
        <ul className="flex flex-col gap-2">
          {lastDone && (
            <li className="flex items-center justify-between gap-3 rounded-xl border border-volt/30 bg-surface px-4 py-3">
              <span className="truncate text-body-lg">{lastDone.titleHe ?? "אימון"}</span>
              <Chip tone="volt">
                <CheckIcon className="size-3.5" />
                הושלם
              </Chip>
            </li>
          )}
          {upcoming.map((w, i) => (
            <li key={w.id} className="ff-slide-in flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 opacity-70" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="truncate text-body-lg">{w.titleHe ?? "אימון"}</span>
              <span className="text-label-md text-text-muted">{w.type === "challenge" ? "אתגר" : w.estMinutes !== null ? `${w.estMinutes} דק׳` : ""}</span>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
