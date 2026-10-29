import { parseApiDate } from "@/lib/api";

/** "היום", "אתמול" or a short date, for lists and headers. */
export function whenLabel(value: string): string {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days <= 0) return "היום";
  if (days === 1) return "אתמול";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

/** "14:05" for the small time under a message. */
export function timeLabel(value: string): string {
  const date = parseApiDate(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}
