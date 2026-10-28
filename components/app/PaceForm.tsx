"use client";

import { useState, type FormEvent } from "react";
import { describeError } from "@/lib/api";
import { FIVE_K_MAX_SEC, FIVE_K_MIN_SEC, clockText, parseFiveK, splitFiveK } from "@/lib/pace";
import Button from "../ui/Button";
import { useSession } from "./Session";

const FIELD =
  "h-12 w-full rounded-xl bg-white/[0.07] px-3 text-center font-heading text-body-lg font-bold tabular-nums text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

/** Enter or change the 5 km time. Inputs are 16px (body-lg) so iOS does not zoom the page on focus. */
export default function PaceForm({ onSaved, submitLabel = "שמירה" }: { onSaved?: () => void; submitLabel?: string }) {
  const { pace, savePace } = useSession();
  const initial = splitFiveK(pace?.fiveKSec ?? null);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [seconds, setSeconds] = useState(initial.seconds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const total = parseFiveK(minutes, seconds);
    if (total === null) {
      setError(`הזינו זמן בין ${clockText(FIVE_K_MIN_SEC)} ל־${clockText(FIVE_K_MAX_SEC)}, למשל 24 דקות ו־30 שניות.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await savePace(total);
      onSaved?.();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <div className="flex items-end gap-2" dir="ltr">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-label-md text-text-secondary" dir="rtl">
            דקות
          </span>
          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="25"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
            className={FIELD}
            aria-label="דקות"
          />
        </label>
        <span aria-hidden="true" className="pb-3 font-heading text-headline-sm font-bold text-text-muted">
          :
        </span>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-label-md text-text-secondary" dir="rtl">
            שניות
          </span>
          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="00"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value.replace(/\D/g, ""))}
            className={FIELD}
            aria-label="שניות"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-body-md text-ember">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={busy}>
        {busy ? "שומר…" : submitLabel}
      </Button>
    </form>
  );
}
