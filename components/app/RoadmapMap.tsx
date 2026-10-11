"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import type { Roadmap, RoadmapLevel, RoadmapWorkout } from "@/lib/api";
import { BoltIcon, CheckIcon, FlagIcon, LockIcon, PlayIcon, StarIcon } from "./icons";
import { useChromeOverride } from "./Chrome";
import { useInView, useOnScreen } from "./hooks";
import { ZoneBackground, dominantVenue, themeFor, type Theme, type Venue } from "./RoadmapScenery";

// The map is one tall painted world with a fixed width (VB_W units) that scales with its container, so it looks the same
// on a phone and on a wide screen. Each level is a zone with its own painted background and colours (RoadmapScenery);
// one striped road snakes down through every stop; stops and banners are HTML placed by percentage on top, so they stay
// crisp, focusable and clickable.
const VB_W = 400;
const AMPLITUDE = 104;
const STEP = 150; // vertical distance between stops
const BANNER_GAP = 132; // from a level banner to its first stop
const BANNER_DROP = 150; // from a level's gate (its challenge) down to the next level's banner
const PAD_TOP = 78;
const PAD_BOTTOM = 130;

type Pt =
  | { kind: "banner"; level: RoadmapLevel; levelIndex: number; x: number; y: number; below: RoadmapLevel | null }
  | { kind: "stop"; workout: RoadmapWorkout; level: RoadmapLevel; levelIndex: number; number: number; x: number; y: number };

function layout(roadmap: Roadmap) {
  const pts: Pt[] = [];
  const gates: number[] = []; // y of each level's challenge: the border between that level and the next
  let y = PAD_TOP;
  let k = 0;
  roadmap.levels.forEach((level, li) => {
    if (li > 0) y = gates[li - 1] + BANNER_DROP;
    pts.push({ kind: "banner", level, levelIndex: li, x: VB_W / 2, y, below: li > 0 ? roadmap.levels[li - 1] : null });
    let first = true;
    level.workouts.forEach((workout, wi) => {
      y += first ? BANNER_GAP : STEP;
      first = false;
      const x = VB_W / 2 + AMPLITUDE * Math.sin(k * 1.15 + 0.6);
      k++;
      pts.push({ kind: "stop", workout, level, levelIndex: li, number: wi + 1, x, y });
    });
    const lastIsChallenge = level.workouts.length > 0 && level.workouts[level.workouts.length - 1].type === "challenge";
    gates.push(level.workouts.length === 0 ? y + 60 : lastIsChallenge ? y : y + 70);
  });
  const height = gates[gates.length - 1] + PAD_BOTTOM;
  const zones = gates.map((gate, i) => ({
    index: i,
    top: i === 0 ? 0 : gates[i - 1],
    bottom: i === gates.length - 1 ? height : gate,
  }));
  return { pts, height, zones, gates };
}

/** A smooth curve through all points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;

export type MapRewards = { workout: number; challenge: number };

/** The whole plan as one painted world with a striped road to scroll down, level after level. */
export default function RoadmapMap({ roadmap, rewards }: { roadmap: Roadmap; rewards: MapRewards }) {
  const uid = useId().replace(/:/g, "");
  const { pts, height, zones, gates } = useMemo(() => layout(roadmap), [roadmap]);
  const themes = useMemo(() => {
    const list: Theme[] = [];
    let venue: Venue = "park"; // an empty level keeps the venue of the one before it
    for (let i = 0; i < roadmap.levels.length; i++) {
      venue = dominantVenue(roadmap.levels[i].workouts.map((w) => w.sport)) ?? venue;
      list.push(themeFor(venue, i));
    }
    return list;
  }, [roadmap]);
  const d = useMemo(() => smoothPath(pts), [pts]);

  const stops = pts.filter((p): p is Extract<Pt, { kind: "stop" }> => p.kind === "stop");
  const current = stops.find((p) => p.workout.state === "current") ?? null;
  const lastDone = [...stops].reverse().find((p) => p.workout.state === "done") ?? null;
  const progressY = (current ?? lastDone)?.y ?? 0;
  const progressTheme = themes[(current ?? lastDone)?.levelIndex ?? 0] ?? themes[0];
  const allDone = roadmap.planCompleted;

  // bring the customer's own spot into view once, after the entrance animations have started
  const currentRef = useRef<HTMLDivElement | null>(null);
  const [watchRef, onScreen] = useOnScreen<HTMLDivElement>();
  useEffect(() => {
    const node = currentRef.current;
    if (!node) return;
    const timer = window.setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "center" }), 700);
    return () => window.clearTimeout(timer);
  }, [roadmap.planSlug]);

  // the app bars wear the colour of the zone under them: top bar and status strip from the zone at the top of the
  // screen, bottom bar from the zone at the bottom, accent from the middle; reported as the customer scrolls
  const setChrome = useChromeOverride();
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let frame = 0;
    let last = "";
    const zoneAt = (viewportY: number, rect: DOMRect) => {
      const y = ((viewportY - rect.top) / rect.height) * height;
      return themes[Math.max(0, Math.min(zones.length - 1, zones.findIndex((z) => y >= z.top && y < z.bottom)))] ?? themes[0];
    };
    const update = () => {
      frame = 0;
      const node = mapRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const topZone = zoneAt(Math.max(rect.top + 4, 70), rect);
      const bottomZone = zoneAt(Math.min(rect.bottom - 4, window.innerHeight - 40), rect);
      const midZone = zoneAt(window.innerHeight * 0.45, rect);
      const key = `${topZone.chrome}|${bottomZone.chrome}|${midZone.accent}`;
      if (key === last) return;
      last = key;
      setChrome({ top: topZone.chrome, bottom: bottomZone.chrome, accent: midZone.accent });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      setChrome(null);
    };
  }, [themes, zones, height, setChrome]);

  /** colour stops that follow the zones, so the road changes colour with the level */
  const roadStops = (pick: (t: Theme) => string) =>
    zones.flatMap((z) => {
      const c = pick(themes[z.index]);
      return [
        <stop key={`a${z.index}`} offset={Math.max(0, (z.top + 24) / height)} stopColor={c} />,
        <stop key={`b${z.index}`} offset={Math.min(1, (z.bottom - 24) / height)} stopColor={c} />,
      ];
    });

  return (
    <div
      ref={mapRef}
      className="relative -mx-gutter w-auto overflow-hidden bg-canvas [container-type:inline-size] md:mx-auto md:max-w-[620px] md:rounded-3xl md:border-[3px] md:border-white/70 md:shadow-2xl"
      style={{ aspectRatio: `${VB_W} / ${height}` }}
    >
      <svg viewBox={`0 0 ${VB_W} ${height}`} className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="xMidYMin slice">
        <defs>
          {zones.map((z) => {
            const t = themes[z.index];
            return (
              <linearGradient key={z.index} id={`${uid}-sky-${z.index}`} gradientUnits="userSpaceOnUse" x1="0" y1={z.top} x2="0" y2={z.bottom}>
                <stop offset="0" stopColor={t.sky[0]} />
                <stop offset="0.5" stopColor={t.sky[1]} />
                <stop offset="1" stopColor={t.sky[2]} />
              </linearGradient>
            );
          })}
          <linearGradient id={`${uid}-edge`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={height}>
            {roadStops((t) => t.roadEdge)}
          </linearGradient>
          <linearGradient id={`${uid}-inner`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={height}>
            {roadStops((t) => t.roadInner)}
          </linearGradient>
          <linearGradient id={`${uid}-stripe`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={height}>
            {roadStops((t) => t.roadStripe)}
          </linearGradient>
          <pattern id={`${uid}-check`} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#fff" />
            <rect x="8" y="8" width="8" height="8" fill="#fff" />
            <rect x="8" width="8" height="8" fill="#111" opacity="0.55" />
            <rect y="8" width="8" height="8" fill="#111" opacity="0.55" />
          </pattern>
          <clipPath id={`${uid}-done`}>
            <rect x="-20" y="-20" width={VB_W + 40} height={progressY + 22} className="ff-draw" />
          </clipPath>
        </defs>

        {zones.map((z) => (
          <ZoneBackground key={z.index} index={z.index} top={z.top} bottom={z.bottom} width={VB_W} theme={themes[z.index]} gradientId={`${uid}-sky-${z.index}`} clipId={`${uid}-zone-${z.index}`} />
        ))}

        {/* the gate: each level's challenge sits on the border to the next level, with a chequered line across the road */}
        {gates.map((gate, i) => (
          <g key={`gate${i}`}>
            <rect x="0" y={gate - 9} width={VB_W} height="18" fill="rgba(0,0,0,0.3)" transform="translate(0 4)" />
            <rect x="0" y={gate - 9} width={VB_W} height="18" fill={`url(#${uid}-check)`} opacity="0.92" />
          </g>
        ))}

        {/* the road: edge, body, then candy stripes laid across it */}
        <path d={d} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="40" strokeLinecap="round" transform="translate(0 5)" />
        <path d={d} fill="none" stroke={`url(#${uid}-edge)`} strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={`url(#${uid}-inner)`} strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={`url(#${uid}-stripe)`} strokeWidth="27" strokeLinecap="butt" strokeDasharray="7 13" />

        {/* the part already travelled glows in the level's colour, drawing itself down from the top */}
        <g clipPath={`url(#${uid}-done)`}>
          <path d={d} fill="none" stroke={progressTheme.doneDark} strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke={progressTheme.done} strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="27" strokeDasharray="7 13" />
        </g>
      </svg>

      {pts.map((p, i) =>
        p.kind === "banner" ? (
          <Banner key={`b${p.level.id}`} point={p} total={height} index={i} theme={themes[p.levelIndex]} />
        ) : (
          <Stop key={p.workout.id} point={p} total={height} rewards={rewards} theme={themes[p.levelIndex]} isCurrent={p === current} refs={p === current ? { currentRef, watchRef } : undefined} />
        ),
      )}

      {allDone && (
        <div className="ff-pop-in absolute inset-x-0 flex justify-center" style={{ top: pct(height - 74, height) }}>
          <div className="flex items-center gap-2 rounded-full border-2 border-white/80 bg-gradient-to-b from-[#ffd54a] to-[#ff9d1c] px-5 py-2.5 font-heading text-body-lg font-extrabold text-[#4a2a00] shadow-lg">
            <StarIcon className="size-5" />
            סיימתם את כל המסלול!
          </div>
        </div>
      )}

      {current && !onScreen && (
        <button
          type="button"
          onClick={() => currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="ff-pop-in fixed bottom-24 left-1/2 z-30 flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-ember px-5 font-heading text-body-md font-bold text-canvas shadow-glow-ember lg:bottom-8"
        >
          <PlayIcon className="size-3.5" />
          חזרה למקום שלי
        </button>
      )}
    </div>
  );
}

// ---------- level banner: a folded ribbon in the level's colours ----------

function Banner({ point, total, index, theme }: { point: Extract<Pt, { kind: "banner" }>; total: number; index: number; theme: Theme }) {
  const { level, below } = point;
  const [ref, seen] = useInView<HTMLDivElement>();
  const done = level.workouts.filter((w) => w.state === "done").length;
  const name = level.nameHe ?? `רמה ${level.levelNumber}`;
  const skip = level.state === "locked" ? below?.workouts.find((w) => w.type === "challenge" && w.canAttempt) : undefined;
  const dim = level.state === "locked" || level.state === "skipped";

  return (
    <div className="absolute left-1/2 z-10 w-[90%] -translate-x-1/2 -translate-y-1/2" style={{ top: pct(point.y, total) }}>
      <div ref={ref} className={`ff-reveal ${seen ? "is-in" : ""}`} style={{ transitionDelay: `${Math.min(index, 3) * 60}ms` }}>
        <div
          className={`relative flex items-center justify-between gap-3 px-8 py-3 shadow-[0_6px_0_rgba(0,0,0,0.28)] ${dim ? "saturate-[0.35]" : ""}`}
          style={{
            background: `linear-gradient(180deg, ${theme.ribbon[0]}, ${theme.ribbon[1]})`,
            color: theme.ribbonText,
            clipPath: "polygon(0 0, 100% 0, calc(100% - 16px) 50%, 100% 100%, 0 100%, 16px 50%)",
          }}
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-white/20" />
          <div className="relative min-w-0">
            <p className="text-label-md font-bold opacity-80">רמה {level.levelNumber}</p>
            <h2 className="truncate font-heading text-headline-sm font-extrabold leading-5">{name}</h2>
          </div>
          <div className="relative flex shrink-0 items-center gap-2">
            {level.workouts.length > 0 && (
              <span dir="ltr" className="rounded-md bg-black/25 px-2 py-0.5 text-label-md font-extrabold tabular-nums text-white">
                {done}/{level.workouts.length}
              </span>
            )}
            {level.state === "done" && <CheckIcon className="size-5" />}
            {level.state === "locked" && <LockIcon className="size-5" />}
            {level.state === "skipped" && <span className="text-label-md font-bold">דולג</span>}
            {level.state === "current" && <BoltIcon className="ff-flame size-5" />}
          </div>
        </div>
        {skip && (
          <Link
            href={`/workout/${skip.id}`}
            className="mt-3 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-white/70 bg-black/55 px-4 py-2.5 text-body-md text-white backdrop-blur-md transition hover:bg-black/70"
          >
            <span>כבר ברמה הזו? דלגו עם אתגר המעבר</span>
            <span className="font-extrabold text-[#ffd54a]">לאתגר ←</span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ---------- one stop on the road: a glossy button with its number ----------

function Stop({
  point,
  total,
  rewards,
  theme,
  isCurrent,
  refs,
}: {
  point: Extract<Pt, { kind: "stop" }>;
  total: number;
  rewards: MapRewards;
  theme: Theme;
  isCurrent: boolean;
  refs?: { currentRef: React.RefObject<HTMLDivElement | null>; watchRef: React.RefObject<HTMLDivElement | null> };
}) {
  const { workout } = point;
  const [ref, seen] = useInView<HTMLDivElement>();
  const challenge = workout.type === "challenge";
  const openable = workout.state === "done" || workout.state === "current" || workout.canAttempt;
  const points = challenge ? rewards.challenge : rewards.workout;
  const size = challenge ? "clamp(80px, 26cqw, 124px)" : "clamp(66px, 21cqw, 100px)";

  const [face, edge] =
    workout.state === "done"
      ? [theme.done, theme.doneDark]
      : workout.state === "current"
        ? ["#ff5637", "#a9301a"]
        : challenge && workout.canAttempt
          ? ["#ffb02e", "#a8620a"]
          : [theme.locked, theme.lockedDark];
  const muted = workout.state === "locked" || workout.state === "skipped";

  const node = (
    <span
      className={`relative flex items-center justify-center rounded-full border-[3px] border-white/85 font-heading font-extrabold text-white transition-transform duration-150 ${
        openable ? "active:translate-y-[5px]" : ""
      } ${workout.state === "skipped" ? "opacity-50" : ""}`}
      style={
        {
          width: size,
          height: size,
          background: `radial-gradient(circle at 34% 24%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 42%), ${face}`,
          boxShadow: `0 7px 0 ${edge}, 0 13px 16px rgba(0,0,0,0.38), inset 0 -6px 10px rgba(0,0,0,0.18)`,
          fontSize: challenge ? "clamp(28px, 9cqw, 44px)" : "clamp(24px, 7.6cqw, 36px)",
          textShadow: "0 2px 0 rgba(0,0,0,0.35)",
        } as CSSProperties
      }
    >
      {challenge ? <FlagIcon className="size-[44%]" /> : <span dir="ltr">{point.number}</span>}
      {workout.state === "done" && (
        <span className="absolute -end-1 -top-1 flex size-[34%] items-center justify-center rounded-full border-2 border-white bg-[#22c55e] text-white shadow">
          <CheckIcon className="size-[62%]" />
        </span>
      )}
      {muted && !challenge && (
        <span className="absolute -bottom-1 -end-1 flex size-[34%] items-center justify-center rounded-full border-2 border-white/80 bg-black/55 text-white">
          <LockIcon className="size-[58%]" />
        </span>
      )}
      {challenge && workout.state !== "locked" && workout.state !== "skipped" && (
        <>
          <StarIcon className="ff-bob absolute -start-1 -top-2 size-5 text-[#ffd54a] drop-shadow" />
          <StarIcon className="ff-bob absolute -end-1 -top-3 size-4 text-white drop-shadow [animation-delay:0.4s]" />
        </>
      )}
    </span>
  );

  return (
    <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(point.x, VB_W), top: pct(point.y, total) }}>
      <div ref={ref} className={`ff-reveal ${seen ? "is-in" : ""} flex flex-col items-center gap-2.5`}>
        <div ref={isCurrent ? refs?.currentRef : undefined} className="relative flex flex-col items-center">
          {isCurrent && (
            <>
              <span aria-hidden="true" className="ff-ring pointer-events-none absolute rounded-full border-[3px] border-white" style={{ width: size, height: size }} />
              <span aria-hidden="true" className="ff-ring pointer-events-none absolute rounded-full border-[3px] border-white/60 [animation-delay:1.2s]" style={{ width: size, height: size }} />
              <span aria-hidden="true" className="ff-halo pointer-events-none absolute -z-10 rounded-full bg-white/40 blur-2xl" style={{ width: `calc(${size} * 1.7)`, height: `calc(${size} * 1.7)` }} />
              <div ref={refs?.watchRef} className="ff-bob absolute -top-12 z-10 whitespace-nowrap rounded-xl border-2 border-ember bg-white px-3 py-1.5 font-heading text-body-md font-extrabold text-canvas shadow-lg">
                {challenge ? "לאתגר!" : "מתחילים!"}
                <span aria-hidden="true" className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-e-2 border-ember bg-white" />
              </div>
            </>
          )}
          {openable ? (
            <Link
              href={`/workout/${workout.id}`}
              aria-label={`${challenge ? "אתגר מעבר רמה" : `אימון ${point.number}`}: ${workout.titleHe ?? ""}`}
              className="relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {node}
            </Link>
          ) : (
            <div role="img" aria-label={`${workout.titleHe ?? "אימון"} (נעול)`}>
              {node}
            </div>
          )}
        </div>

        <div className="flex w-[38cqw] max-w-48 flex-col items-center gap-1 text-center">
          <p className={`line-clamp-2 rounded-lg bg-black/50 px-2 py-0.5 font-heading text-label-md font-bold leading-4 text-white backdrop-blur-sm ${muted ? "opacity-70" : ""}`}>
            {workout.titleHe ?? "אימון"}
          </p>
          {workout.state !== "done" && workout.state !== "skipped" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-label-md font-extrabold text-[#ffd54a]">
              <BoltIcon className="size-3" />
              <span dir="ltr">+{points}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** What the map looks like while it loads: a road and round stops in the first level's colours, pulsing, so the page is never empty. */
export function RoadmapSkeleton() {
  const theme = themeFor("park", 0);
  const pts = Array.from({ length: 6 }, (_, i) => ({ x: VB_W / 2 + AMPLITUDE * Math.sin(i * 1.15 + 0.6), y: PAD_TOP + 90 + i * STEP }));
  const height = PAD_TOP + 90 + 6 * STEP;
  const d = smoothPath(pts);
  return (
    <div
      className="relative -mx-gutter w-auto overflow-hidden bg-surface [container-type:inline-size] md:mx-auto md:max-w-[620px] md:rounded-3xl md:border md:border-border"
      style={{ aspectRatio: `${VB_W} / ${height}` }}
      role="status"
      aria-label="טוען את המסלול"
    >
      <svg viewBox={`0 0 ${VB_W} ${height}`} className="absolute inset-0 size-full" aria-hidden="true">
        <g className="ff-pulse-soft">
          <path d={d} fill="none" stroke={theme.roadEdge} strokeOpacity="0.5" strokeWidth="36" strokeLinecap="round" />
          <path d={d} fill="none" stroke={theme.roadInner} strokeOpacity="0.25" strokeWidth="27" strokeLinecap="round" />
        </g>
      </svg>
      <div aria-hidden="true" className="ff-skeleton absolute left-1/2 h-14 w-[88%] -translate-x-1/2 -translate-y-1/2" style={{ top: pct(PAD_TOP, height) }} />
      {pts.map((p, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ff-skeleton absolute -translate-x-1/2 -translate-y-1/2 !rounded-full"
          style={{ left: pct(p.x, VB_W), top: pct(p.y, height), width: "clamp(66px, 21cqw, 100px)", height: "clamp(66px, 21cqw, 100px)", animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}
