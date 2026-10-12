"use client";

import { useId } from "react";
import { ZoneBackground, type Theme } from "./RoadmapScenery";

const W = 400;
const H = 900;

/**
 * The painted venue of a level (the running track, the pool, the gym floor, the park, in the level's time of day) as a
 * fixed full-screen backdrop for the workout pages, so a workout looks like the place it belongs to. It is the same
 * scenery as the roadmap, held still (no drifting clouds or twinkling) and dimmed so the text and cards stay readable.
 */
export default function VenueBackdrop({ theme, className = "z-0" }: { theme: Theme; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 overflow-hidden ${className} [&_*]:![animation:none]`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`${uid}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
            <stop offset="0" stopColor={theme.sky[0]} />
            <stop offset="0.5" stopColor={theme.sky[1]} />
            <stop offset="1" stopColor={theme.sky[2]} />
          </linearGradient>
        </defs>
        <ZoneBackground index={0} top={0} bottom={H} width={W} theme={theme} gradientId={`${uid}-sky`} clipId={`${uid}-clip`} />
      </svg>
      {/* a veil, so the scene reads as a backdrop: lighter at the top, darker where the content sits */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/30 via-canvas/55 to-canvas/80" />
    </div>
  );
}
