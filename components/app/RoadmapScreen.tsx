"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, describeError, type Roadmap } from "@/lib/api";
import { ratio } from "@/lib/gamify";
import { levelProgress, nextUp } from "@/lib/training";
import { buttonClasses } from "../ui/Button";
import { BoltIcon, FlameIcon, PlayIcon } from "./icons";
import RoadmapHud from "./RoadmapHud";
import RoadmapMap, { RoadmapSkeleton } from "./RoadmapMap";
import { useSession } from "./Session";
import { CountUp, ProgressRing, Skeleton } from "./ui";

/**
 * The active plan as one painted world to scroll down. The whole page speaks the map's design language: on phones the
 * game menu lives in the app header and the map starts right under it; on wide screens the menu sticks above the map
 * and a game-style summary panel sits beside it.
 */
export default function RoadmapScreen() {
  const { plans, activePlan, stats } = useSession();
  const slug = activePlan?.planSlug ?? null;
  const [loaded, setLoaded] = useState<{ slug: string; roadmap: Roadmap } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api
      .roadmap(slug)
      .then((roadmap) => {
        if (!cancelled) {
          setLoaded({ slug, roadmap });
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const roadmap = loaded && loaded.slug === slug ? loaded.roadmap : null;
  const rewards = stats?.rewards ?? { workout: 100, challenge: 300 };

  return (
    <>
      <RoadmapHud className="sticky top-4 z-30 hidden rounded-full bg-black/40 p-1.5 backdrop-blur-xl lg:flex" />

      {plans.length === 0 && (
        <p className="mt-4 rounded-2xl border-[3px] border-white/60 bg-black/40 p-6 text-center text-body-md text-white">
          עדיין לא שייכנו לכם תוכנית. נעדכן ברגע שהיא מוכנה.
        </p>
      )}

      {error && (
        <p role="alert" className="ff-fade-in mt-4 rounded-xl border-2 border-white/70 bg-black/55 p-4 text-body-md text-[#ffb09a]">
          {error}
        </p>
      )}

      {slug && !error && (
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
          <div className="min-w-0 lg:order-1">{roadmap ? <RoadmapMap key={roadmap.planSlug} roadmap={roadmap} rewards={rewards} /> : <RoadmapSkeleton />}</div>
          <aside className="hidden lg:sticky lg:top-24 lg:order-2 lg:block">{roadmap ? <Summary roadmap={roadmap} /> : <Skeleton className="h-52" />}</aside>
        </div>
      )}
    </>
  );
}

/** The wide-screen summary: a glossy game panel with the level ring, points, streak and the big "continue" button. */
function Summary({ roadmap }: { roadmap: Roadmap }) {
  const { stats } = useSession();
  const progress = levelProgress(roadmap);
  const next = nextUp(roadmap);
  return (
    <section className="ff-rise-in relative overflow-hidden rounded-2xl bg-black/45 p-5 backdrop-blur-xl [animation-delay:120ms]">
      <div className="relative flex items-center gap-4">
        <ProgressRing value={ratio(progress.done, progress.total)} size={88} stroke={9} tone="volt">
          <span dir="ltr" className="font-heading text-headline-sm font-extrabold text-white">
            {progress.done}/{progress.total}
          </span>
        </ProgressRing>
        <div className="min-w-0 text-white">
          <p className="text-label-md font-bold opacity-80">הרמה הנוכחית</p>
          <p className="font-heading text-headline-md font-bold leading-6">{progress.levelName}</p>
          <p className="mt-1 text-label-md font-bold opacity-80">
            רמה {roadmap.currentLevelNumber} מתוך {roadmap.levels.length}
          </p>
        </div>
      </div>

      {stats && (
        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-black/35 px-3 py-2 text-white">
            <BoltIcon className="size-5 text-[#ffd54a]" />
            <div>
              <CountUp value={stats.xp} className="block font-heading text-body-lg font-extrabold" />
              <span className="text-label-md opacity-75">נקודות</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-black/35 px-3 py-2 text-white">
            <FlameIcon className="ff-flame size-5 text-[#ff7a3d]" />
            <div>
              <CountUp value={stats.weeklyStreak} className="block font-heading text-body-lg font-extrabold" />
              <span className="text-label-md opacity-75">שבועות ברצף</span>
            </div>
          </div>
        </div>
      )}

      {next && (
        <Link href={`/workout/${next.workout.id}`} className={`${buttonClasses({ size: "lg", fullWidth: true, variant: "game" })} relative mt-5`}>
          <PlayIcon className="size-4" />
          {next.workout.type === "challenge" ? "לאתגר המעבר" : "להמשיך באימון הבא"}
        </Link>
      )}
    </section>
  );
}
