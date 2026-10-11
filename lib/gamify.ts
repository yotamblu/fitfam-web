// Game-layer copy: account rank titles and small helpers. The numbers themselves (points, level, streak) come from the API.

const TITLES = ["טירון", "מתחיל", "מתמיד", "לוחם", "אתלט", "מקצוען", "אלוף", "אגדה"];

/** The Hebrew rank name for an account level (levels beyond the list keep the top rank). */
export function rankTitle(level: number): string {
  return TITLES[Math.min(Math.max(level, 1), TITLES.length) - 1];
}

export const WEEKDAY_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

/** 0..1, clamped. */
export function ratio(value: number, max: number): number {
  return max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
}
