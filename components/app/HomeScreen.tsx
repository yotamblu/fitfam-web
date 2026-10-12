"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, describeError, type Roadmap, type Stats } from "@/lib/api";
import { WEEKDAY_LETTERS, rankTitle, ratio } from "@/lib/gamify";
import { SPORT_LABELS, levelProgress, nextUp } from "@/lib/training";
import { buttonClasses } from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import { CheckIcon, ChevronLeftIcon, FlameIcon, PlayIcon } from "./icons";
import { Card, Meta, RowList, SectionTitle } from "./primitives";
import { releaseSplash } from "@/lib/splash";
import { useSession } from "./Session";
import { CountUp, ProgressRing, Reveal, Skeleton } from "./ui";

/** Today: the one workout to do now, this week at a glance, and the other plans as a quiet list. */
export default function HomeScreen() {
  const { user, plans, activePlan, setActiveSlug, stats } = useSession();
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

  // the launch splash stays up until the home screen has everything it needs to show
  const homeReady = roadmaps !== null || error !== null;
  useEffect(() => {
    if (homeReady) releaseSplash();
  }, [homeReady]);

  const firstName = (user.displayName ?? "").split(" ")[0];
  const today = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  const primary = roadmaps?.find((r) => r.planSlug === activePlan?.planSlug) ?? roadmaps?.[0] ?? null;
  const others = roadmaps?.filter((r) => r !== primary) ?? [];

  return (
    <>
      <header className="ff-rise-in">
        <p className="text-body-md text-text-secondary">{today}</p>
        <h1 className="mt-0.5 font-heading text-headline-md font-bold lg:text-[32px] lg:leading-10">שלום{firstName ? `, ${firstName}` : ""}</h1>
      </header>

      {error && (
        <p role="alert" className="ff-fade-in rounded-xl bg-ember/10 p-4 text-body-md text-ember">
          {error}
        </p>
      )}

      {plans.length === 0 ? (
        <Card className="ff-rise-in p-8 text-center">
          <p className="font-heading text-headline-sm font-bold">התוכנית שלכם בדרך</p>
          <p className="mt-1 text-body-md text-text-secondary">עדיין לא שייכנו לכם תוכנית אימון. נעדכן ברגע שהיא מוכנה.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 lg:max-w-3xl">
          {/* who you are and how far you are first, then the one workout to do, then the rest */}
          <div className="min-w-0">{stats ? <ProgressCard stats={stats} user={user} /> : <Skeleton className="h-64" />}</div>

          <div className="min-w-0">
            {!roadmaps && !error && <Skeleton className="h-60" />}
            {primary && <TodayCard roadmap={primary} reward={stats?.rewards} />}
          </div>

          {others.length > 0 && (
            <div className="min-w-0">
              <Reveal>
                <div className="flex flex-col gap-3">
                  <SectionTitle>התוכניות שלי</SectionTitle>
                  <RowList>
                    {others.map((roadmap) => (
                      <OtherPlan key={roadmap.planSlug} roadmap={roadmap} onOpen={() => setActiveSlug(roadmap.planSlug)} />
                    ))}
                  </RowList>
                </div>
              </Reveal>
            </div>
          )}

          {stats && (
            <div className="min-w-0">
              <WeeksChart stats={stats} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ---------- today ----------

function TodayCard({ roadmap, reward }: { roadmap: Roadmap; reward?: Stats["rewards"] }) {
  const next = nextUp(roadmap);
  const progress = levelProgress(roadmap);

  if (roadmap.planCompleted) {
    return (
      <Card className="ff-rise-in p-6">
        <p className="text-body-md text-text-secondary">{roadmap.planNameHe}</p>
        <h2 className="mt-1 font-heading text-headline-md font-bold">סיימתם את כל הרמות</h2>
        <p className="mt-1 text-body-md text-text-secondary">אפשר לחזור לכל אימון בקריאה בלבד.</p>
        <Link href="/roadmap" className={`${buttonClasses({ variant: "secondary" })} mt-5`}>
          למסלול
        </Link>
      </Card>
    );
  }

  const points = next ? (next.workout.type === "challenge" ? reward?.challenge : reward?.workout) : undefined;

  return (
    <Card className="ff-rise-in p-5 sm:p-6" style={{ animationDelay: "60ms" }}>
      <p className="text-body-md text-text-secondary">
        {roadmap.planNameHe} · {progress.levelName}
      </p>

      {next ? (
        <>
          <h2 className="mt-3 font-heading text-[28px] font-bold leading-9 sm:text-[32px] sm:leading-10">{next.workout.titleHe ?? "אימון"}</h2>
          <Meta
            className="mt-2"
            items={[
              next.workout.type === "challenge" ? "אתגר מעבר רמה" : `אימון ${next.position} מתוך ${next.total}`,
              next.workout.estMinutes !== null && `${next.workout.estMinutes} דק׳`,
              SPORT_LABELS[next.workout.sport],
              points !== undefined && `+${points} נקודות`,
            ]}
          />

          <div className="mt-5 flex items-center gap-3">
            <ProgressBar value={progress.done} max={progress.total} label="התקדמות ברמה" />
            <span dir="ltr" className="shrink-0 text-label-md tabular-nums text-text-secondary">
              {progress.done}/{progress.total}
            </span>
          </div>

          <Link href={`/workout/${next.workout.id}`} className={`${buttonClasses({ size: "lg", fullWidth: true })} mt-5`}>
            <PlayIcon className="size-4" />
            {next.workout.type === "challenge" ? "לאתגר" : "התחלת האימון"}
          </Link>
        </>
      ) : (
        <>
          <h2 className="mt-3 font-heading text-headline-md font-bold">האימונים ברמה הזו בהכנה</h2>
          <p className="mt-1 text-body-md text-text-secondary">עדיין אין אימון מוכן. אפשר להציץ במסלול.</p>
          <Link href="/roadmap" className={`${buttonClasses({ variant: "secondary" })} mt-5`}>
            למסלול
          </Link>
        </>
      )}
    </Card>
  );
}

function OtherPlan({ roadmap, onOpen }: { roadmap: Roadmap; onOpen: () => void }) {
  const next = nextUp(roadmap);
  const progress = levelProgress(roadmap);
  return (
    <li>
      <Link href="/roadmap" onClick={onOpen} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.04]">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-body-lg font-bold">{roadmap.planNameHe}</p>
          <p className="truncate text-body-md text-text-secondary">
            {progress.levelName}
            {next ? ` · הבא: ${next.workout.titleHe ?? "אימון"}` : roadmap.planCompleted ? " · הושלם" : ""}
          </p>
        </div>
        <ChevronLeftIcon className="size-5 shrink-0 text-text-muted" />
      </Link>
    </li>
  );
}

// ---------- progress ----------

/** Level, this week and the streak in one grouped surface, so the three facts read as one glance. */
export function ProgressCard({ stats, user }: { stats: Stats; user?: { displayName: string | null; email: string; avatarUrl: string | null } }) {
  const toNext = stats.xpForNextLevel - stats.xpIntoLevel;
  const left = Math.max(0, stats.weeklyGoal - stats.weekCount);
  return (
    <Card className="ff-rise-in divide-y divide-white/[0.06] [animation-delay:120ms]">
      <div className="p-5">
        {user && (
          <div className="mb-4 flex items-center gap-3">
            {/* the ring is the progress to the next level; the badge is the current level */}
            <div className="relative shrink-0 pb-2" aria-label={`רמה ${stats.level}`}>
              <ProgressRing value={ratio(stats.xpIntoLevel, stats.xpForNextLevel)} size={80} stroke={5}>
                <span className="flex size-[62px] items-center justify-center overflow-hidden rounded-full bg-surface-raised font-heading text-headline-sm font-bold">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                  ) : (
                    (user.displayName ?? user.email).slice(0, 1).toUpperCase()
                  )}
                </span>
              </ProgressRing>
              <span
                dir="ltr"
                className="absolute bottom-0 left-1/2 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-surface bg-ember px-1.5 font-heading text-label-md font-bold tabular-nums text-canvas"
              >
                {stats.level}
              </span>
            </div>
            <p className="min-w-0 truncate font-heading text-body-lg font-bold">{user.displayName ?? user.email}</p>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-heading text-body-lg font-bold">
            רמה <CountUp value={stats.level} /> · {rankTitle(stats.level)}
          </p>
          <p dir="ltr" className="text-body-md tabular-nums text-text-secondary">
            <CountUp value={stats.xp} /> pts
          </p>
        </div>
        <div className="mt-3">
          <ProgressBar value={stats.xpIntoLevel} max={stats.xpForNextLevel} label="התקדמות לרמה הבאה" />
        </div>
        <p dir="rtl" className="mt-2 text-label-md text-text-secondary">
          עוד <span dir="ltr">{toNext}</span> נקודות לרמה {stats.level + 1}
        </p>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-heading text-body-lg font-bold">השבוע</p>
          <p className="text-body-md text-text-secondary">
            <span dir="ltr" className="tabular-nums">
              {stats.weekCount}/{stats.weeklyGoal}
            </span>{" "}
            אימונים
          </p>
        </div>
        <ol className="mt-3 grid grid-cols-7 gap-1" aria-label="הימים השבוע">
          {stats.weekDays.map((active, i) => {
            const isToday = i === stats.todayIndex;
            return (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-canvas transition-colors ${
                    active ? "bg-volt" : isToday ? "ring-2 ring-inset ring-white/40" : "bg-white/[0.07]"
                  }`}
                >
                  {active && <CheckIcon className="size-4" />}
                </span>
                <span className={`text-label-md ${isToday ? "font-bold text-text-primary" : "text-text-muted"}`}>{WEEKDAY_LETTERS[i]}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-body-md text-text-secondary">
          {left === 0 ? "היעד השבועי הושלם." : stats.weekCount === 0 ? "עוד לא התאמנתם השבוע." : `עוד ${left} ${left === 1 ? "אימון" : "אימונים"} ליעד השבועי.`}
        </p>
      </div>

      <div className="flex items-center gap-3 p-5">
        <FlameIcon filled={stats.weeklyStreak > 0} className={`size-6 shrink-0 ${stats.weeklyStreak > 0 ? "text-ember" : "text-text-muted"}`} />
        <div>
          <p className="font-heading text-body-lg font-bold">
            <CountUp value={stats.weeklyStreak} /> שבועות ברצף
          </p>
          <p className="text-label-md text-text-secondary">שבוע נחשב כשיש בו לפחות אימון אחד</p>
        </div>
      </div>
    </Card>
  );
}

function WeeksChart({ stats }: { stats: Stats }) {
  const peak = Math.max(stats.weeklyGoal, ...stats.recentWeeks, 1);
  const last = stats.recentWeeks.length - 1;
  return (
    <Reveal>
      <div className="flex flex-col gap-3">
        <SectionTitle aside={`${stats.totalWorkouts} אימונים בסך הכול`}>השבועות האחרונים</SectionTitle>
        <Card className="p-5">
          <ol className="flex h-28 items-end gap-3" dir="ltr" aria-label="אימונים בכל שבוע">
            {stats.recentWeeks.map((count, i) => (
              <li key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-label-md tabular-nums text-text-secondary">{count}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`ff-grow-y w-full rounded-md ${i === last ? "bg-ember" : count > 0 ? "bg-white/30" : "bg-white/10"}`}
                    style={{ height: `${Math.max(count === 0 ? 5 : 12, ratio(count, peak) * 100)}%`, animationDelay: `${i * 70}ms` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </Reveal>
  );
}
