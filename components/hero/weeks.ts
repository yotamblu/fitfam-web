// Illustrative sample weeks for the landing visuals (copied from the roadmap design reference).
export type WeekStatus = "done" | "active" | "locked";

export interface Week {
  n: number;
  title: string;
  pts: number;
  status: WeekStatus;
}

export const WEEKS: Week[] = [
  { n: 1, title: "מבחן כוח ובסיס", pts: 2400, status: "done" },
  { n: 2, title: "אירובי וקליסטניקס", pts: 2750, status: "done" },
  { n: 3, title: "כוח מתפרץ ורגליים", pts: 3100, status: "active" },
  { n: 4, title: "סבולת שריר אינטנסיבית", pts: 3400, status: "locked" },
  { n: 5, title: "פיק עצימות וכוח מרבי", pts: 3800, status: "locked" },
];

export const pad = (n: number) => String(n).padStart(2, "0");
