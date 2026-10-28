// Personal running paces: the API computes them from the customer's 5 km time; this file only formats and parses.

import type { PaceInfo } from "./api";

export const FIVE_K_MIN_SEC = 720; // 12:00
export const FIVE_K_MAX_SEC = 4200; // 70:00

/** Isolates a run of digits so it keeps its left-to-right order inside Hebrew text. */
const ltr = (text: string) => `⁦${text}⁩`;

export function clockText(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function range(a: number | null, b: number | null): string | null {
  if (a === null || b === null) return null;
  return a === b ? clockText(a) : `${clockText(a)}–${clockText(b)}`;
}

/** "4:50–5:10" (minutes per km) or null while there is no 5 km time. */
export function paceRange(pace: PaceInfo): string | null {
  return range(pace.fastSecPerKm, pace.slowSecPerKm);
}

/** Target time of one repeat, "1:31–1:36", or null. */
export function repRange(pace: PaceInfo): string | null {
  return range(pace.repFastSec, pace.repSlowSec);
}

/** One line for the workout preview: "קצב סף 4:10–4:20 דק׳/ק״מ", or the name and feel while the 5 km time is missing. */
export function paceLine(pace: PaceInfo): string {
  const r = paceRange(pace);
  if (!r) return `${pace.labelHe}: ${pace.feelHe}`;
  return `${pace.labelHe} ${ltr(r)} דק׳/ק״מ`;
}

export function repLine(pace: PaceInfo): string | null {
  const r = repRange(pace);
  return r ? `זמן לחזרה ${ltr(r)}` : null;
}

/** Minutes and seconds typed in the form -> seconds, or null when they are not a valid 5 km time. */
export function parseFiveK(minutes: string, seconds: string): number | null {
  if (!/^\d{1,2}$/.test(minutes.trim()) || !/^\d{0,2}$/.test(seconds.trim())) return null;
  const m = Number(minutes);
  const s = seconds.trim() === "" ? 0 : Number(seconds);
  if (s > 59) return null;
  const total = m * 60 + s;
  return total >= FIVE_K_MIN_SEC && total <= FIVE_K_MAX_SEC ? total : null;
}

export function splitFiveK(seconds: number | null): { minutes: string; seconds: string } {
  if (seconds === null) return { minutes: "", seconds: "" };
  return { minutes: String(Math.floor(seconds / 60)), seconds: String(seconds % 60).padStart(2, "0") };
}
