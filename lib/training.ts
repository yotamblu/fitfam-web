// Display helpers for plans, workouts and the guided player (Hebrew copy, formatting, the exercise preview list).

import type { NodeState, Roadmap, RoadmapWorkout, Sport, Step, StepTarget } from "./api";

export const SPORT_LABELS: Record<Sport, string> = {
  running: "ריצה",
  swimming: "שחייה",
  gym: "חדר כושר",
  calisthenics: "קליסטניקס",
};

export const BLOCK_LABELS: Record<string, string> = {
  straight: "סטים",
  circuit: "סבבים",
  amrap: "AMRAP · כמה שיותר בזמן",
  emom: "EMOM · כל דקה",
  for_time: "על זמן",
  endurance: "ריצה / שחייה",
};

export const ZONE_HINT = "אזור 1 קל מאוד, אזור 5 מקסימלי";

export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} שניות`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} דק׳` : `${minutes}:${String(rest).padStart(2, "0")} דק׳`;
}

export function formatDistance(meters: number): string {
  return meters >= 1000 && meters % 100 === 0 ? `${meters / 1000} ק״מ` : `${meters} מ׳`;
}

/** "mm:ss" for a countdown. */
export function clock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

/** The one big number of a target and its unit, for the player ("10" + "חזרות", "3:00", "400" + "מטר"). */
export function targetParts(target: StepTarget): { value: string; unit: string } {
  if (target.reps !== null) return { value: target.repsMax !== null ? `${target.reps}–${target.repsMax}` : String(target.reps), unit: "חזרות" };
  if (target.distanceM !== null) {
    return target.distanceM >= 1000 && target.distanceM % 100 === 0
      ? { value: String(target.distanceM / 1000), unit: "ק״מ" }
      : { value: String(target.distanceM), unit: "מטר" };
  }
  if (target.durationSec !== null) return target.durationSec >= 60 ? { value: clock(target.durationSec), unit: "" } : { value: String(target.durationSec), unit: "שניות" };
  if (target.calories !== null) return { value: String(target.calories), unit: "קלוריות" };
  if (target.capSec !== null) return { value: clock(target.capSec), unit: "תקרת זמן" };
  return { value: "MAX", unit: "עד כשל" };
}

/** The main number(s) of a target as short text, e.g. "10 חזרות" or "3 דק׳". */
export function targetHeadline(target: StepTarget): string {
  if (target.reps !== null) {
    return target.repsMax !== null ? `${target.reps}-${target.repsMax} חזרות` : `${target.reps} חזרות`;
  }
  if (target.distanceM !== null) return formatDistance(target.distanceM);
  if (target.durationSec !== null) return formatSeconds(target.durationSec);
  if (target.calories !== null) return `${target.calories} קלוריות`;
  if (target.capSec !== null) return `עד ${formatSeconds(target.capSec)}`;
  return "עד כשל";
}

export function targetDetails(target: StepTarget): string[] {
  const parts: string[] = [];
  if (target.zone !== null) parts.push(`אזור ${target.zone}`);
  if (target.rpe !== null) parts.push(`RPE ${target.rpe}`);
  if (target.loadHe) parts.push(target.loadHe);
  return parts;
}

// ---- the read-only workout preview, built from the same steps the player uses ----

export type PreviewRow = { key: string; name: string; summary: string; youtubeId: string | null };
export type PreviewSection = { title: string | null; rows: PreviewRow[] };

/** Groups the steps by section and folds the sets of one exercise into one row ("3 סטים · 10 חזרות · מנוחה 60 שניות"). */
export function buildPreview(steps: Step[]): PreviewSection[] {
  const sections: PreviewSection[] = [];
  let lastKey = "";
  steps.forEach((step, i) => {
    const title = step.sectionTitle;
    let section = sections[sections.length - 1];
    if (!section || section.title !== title) {
      section = { title, rows: [] };
      sections.push(section);
      lastKey = "";
    }
    if (step.type === "timed_block") {
      const head = [BLOCK_LABELS[step.blockStyle] ?? step.blockStyle];
      if (step.durationSec !== null) head.push(formatSeconds(step.durationSec));
      if (step.roundCount !== null) head.push(`${step.roundCount} סבבים`);
      section.rows.push({
        key: `t${i}`,
        name: (step.targets ?? []).map((t) => t.exercise?.nameHe ?? "תרגיל").join(" + "),
        summary: head.join(" · "),
        youtubeId: null,
      });
      lastKey = "";
      return;
    }
    if (step.type === "rest" || !step.target) return;
    const target = step.target;
    const name = target.exercise?.nameHe ?? "תרגיל";
    const repeats = step.setCount ?? step.roundCount ?? 1;
    const key = `${name}|${targetHeadline(target)}|${step.blockStyle}|${repeats}`;
    // later sets of the same exercise are already described by the first row
    if (key === lastKey && step.setNumber !== null && step.setNumber > 1) return;
    lastKey = key;
    const summary: string[] = [];
    if (step.setCount !== null && step.setCount > 1) {
      summary.push(step.blockStyle === "endurance" ? `${step.setCount} חזרות` : `${step.setCount} סטים`);
    }
    if (step.roundNumber !== null && step.roundCount !== null && step.roundNumber === 1) {
      summary.push(`${step.roundCount} סבבים`);
    }
    summary.push(targetHeadline(target), ...targetDetails(target));
    const next = steps[i + 1];
    if (next && next.type === "rest" && next.durationSec) summary.push(`מנוחה ${formatSeconds(next.durationSec)}`);
    section.rows.push({
      key: `w${i}`,
      name,
      summary: summary.join(" · "),
      youtubeId: target.exercise?.youtubeId ?? null,
    });
  });
  return sections;
}

// ---- roadmap helpers ----

export type NextUp = { workout: RoadmapWorkout; position: number; total: number };

/** The workout the customer should do next on this plan, with its place among the current level's workouts. */
export function nextUp(roadmap: Roadmap): NextUp | null {
  const level = roadmap.levels.find((l) => l.levelNumber === roadmap.currentLevelNumber);
  if (!level) return null;
  const index = level.workouts.findIndex((w) => w.state === "current");
  if (index < 0) return null;
  return { workout: level.workouts[index], position: index + 1, total: level.workouts.length };
}

export function levelProgress(roadmap: Roadmap): { done: number; total: number; levelName: string } {
  const level = roadmap.levels.find((l) => l.levelNumber === roadmap.currentLevelNumber);
  const workouts = level?.workouts ?? [];
  return {
    done: workouts.filter((w) => w.state === "done").length,
    total: workouts.length,
    levelName: level?.nameHe ?? `רמה ${roadmap.currentLevelNumber}`,
  };
}

export function totalDone(roadmap: Roadmap): number {
  return roadmap.levels.reduce((sum, l) => sum + l.workouts.filter((w) => w.state === "done").length, 0);
}

export const STATE_LABELS: Record<NodeState, string> = {
  done: "הושלם",
  current: "הבא בתור",
  locked: "נעול",
  skipped: "דולג",
};
