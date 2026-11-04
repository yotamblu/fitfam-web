"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, type LogSet, type WorkoutLog } from "@/lib/api";
import { InfoIcon } from "./icons";

/** The optional weight and reps log of one workout: what was written, what was written last time, and saving. */
export function useWorkoutLog(workoutId: string, enabled = true) {
  const [log, setLog] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    api
      .workoutLog(workoutId)
      .then((l) => {
        if (!cancelled) setLog(l);
      })
      .catch(() => {
        // the log is optional: without it the workout works as before
      });
    return () => {
      cancelled = true;
    };
  }, [workoutId, enabled]);

  const find = useCallback((exerciseId: string, setNumber: number) => log?.sets.find((s) => s.exerciseId === exerciseId && s.setNumber === setNumber) ?? null, [log]);
  const previous = useCallback((exerciseId: string, setNumber: number) => log?.previous.find((p) => p.exerciseId === exerciseId)?.sets.find((s) => s.setNumber === setNumber) ?? null, [log]);
  const hasPrevious = useCallback((exerciseId: string) => !!log?.previous.some((p) => p.exerciseId === exerciseId), [log]);

  /** Saves one set and keeps the local copy in step; a set with neither value is removed. */
  const save = useCallback(
    (set: LogSet) => {
      setLog((current) => {
        if (!current) return current;
        const rest = current.sets.filter((s) => !(s.exerciseId === set.exerciseId && s.setNumber === set.setNumber));
        return { ...current, sets: set.weightKg === null && set.reps === null ? rest : [...rest, set] };
      });
      return api.saveSet(workoutId, set).catch(() => undefined);
    },
    [workoutId],
  );

  return { log, editable: log?.editable ?? false, find, previous, hasPrevious, save };
}

export type WorkoutLogApi = ReturnType<typeof useWorkoutLog>;

function numberOrNull(text: string): number | null {
  const n = Number(text.replace(",", "."));
  return text.trim() === "" || !Number.isFinite(n) || n < 0 ? null : n;
}

function show(weight: number | null, reps: number | null): string {
  return [weight !== null ? `${weight} ק״ג` : null, reps !== null ? `${reps} חזרות` : null].filter(Boolean).join(" × ");
}

/** One set: the weight and the reps boxes, with last time's numbers one tap away. Saves by itself. */
export function SetRow({ api: logApi, exerciseId, setNumber, label = `סט ${setNumber}` }: { api: WorkoutLogApi; exerciseId: string; setNumber: number; label?: string }) {
  const saved = logApi.find(exerciseId, setNumber);
  const before = logApi.previous(exerciseId, setNumber);
  const [weight, setWeight] = useState(saved?.weightKg?.toString() ?? "");
  const [reps, setReps] = useState(saved?.reps?.toString() ?? "");
  const timer = useRef<number | null>(null);
  const latest = useRef({ weight, reps });

  // the saved values arrive after the first render
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !logApi.log) return;
    loaded.current = true;
    const w = saved?.weightKg?.toString() ?? "";
    const r = saved?.reps?.toString() ?? "";
    setWeight(w);
    setReps(r);
    latest.current = { weight: w, reps: r };
  }, [logApi.log, saved]);

  const save = logApi.save;
  const flush = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    void save({ exerciseId, setNumber, weightKg: numberOrNull(latest.current.weight), reps: numberOrNull(latest.current.reps) === null ? null : Math.round(numberOrNull(latest.current.reps)!) });
  }, [save, exerciseId, setNumber]);

  const changed = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, 500);
  };
  // a pending edit is written when the row goes away (for example on the next step of the player)
  useEffect(() => {
    return () => {
      if (timer.current !== null) flush();
    };
  }, [flush]);

  const fill = () => {
    if (!before) return;
    const w = before.weightKg?.toString() ?? "";
    const r = before.reps?.toString() ?? "";
    setWeight(w);
    setReps(r);
    latest.current = { weight: w, reps: r };
    flush();
  };

  const box = "h-11 w-full rounded-xl bg-white/[0.07] px-3 text-center font-heading text-body-lg font-bold tabular-nums text-text-primary outline-none transition-colors placeholder:font-normal placeholder:text-text-muted focus:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-ember";

  return (
    <div className="flex items-center gap-3">
      <span className="w-11 shrink-0 text-body-md font-semibold text-text-secondary">{label}</span>
      <label className="min-w-0 flex-1">
        <span className="sr-only">משקל בק״ג, {label}</span>
        <input
          dir="ltr"
          inputMode="decimal"
          value={weight}
          placeholder={before?.weightKg?.toString() ?? "ק״ג"}
          onChange={(e) => {
            setWeight(e.target.value);
            latest.current = { ...latest.current, weight: e.target.value };
            changed();
          }}
          onBlur={flush}
          className={box}
        />
      </label>
      <label className="min-w-0 flex-1">
        <span className="sr-only">חזרות, {label}</span>
        <input
          dir="ltr"
          inputMode="numeric"
          value={reps}
          placeholder={before?.reps?.toString() ?? "חזרות"}
          onChange={(e) => {
            setReps(e.target.value);
            latest.current = { ...latest.current, reps: e.target.value };
            changed();
          }}
          onBlur={flush}
          className={box}
        />
      </label>
      {before && weight === "" && reps === "" ? (
        <button type="button" onClick={fill} aria-label={`למלא כמו בפעם הקודמת: ${show(before.weightKg, before.reps)}`} className="h-11 shrink-0 rounded-xl px-2 text-label-md font-semibold text-info transition-colors hover:bg-white/[0.06]">
          כמו קודם
        </button>
      ) : (
        <span className="w-[70px] shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}

/** A short plain-language explanation of what to write and how the numbers move up. Closed by default. */
export function LogHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-body-md text-text-secondary">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="-ms-2 inline-flex h-10 items-center gap-1.5 rounded-xl px-2 font-semibold text-info transition-colors hover:bg-white/[0.06]">
        <InfoIcon className="size-5" />
        מה כותבים כאן?
      </button>
      {open && (
        <div className="ff-fade-in mt-1 flex flex-col gap-2 rounded-xl bg-surface-raised p-3.5">
          <p>
            <span className="font-semibold text-text-primary">משקל וחזרות:</span> לכל סט אפשר לרשום כמה ק״ג הרמתם וכמה חזרות עשיתם. זה לא חובה, ואפשר לשנות בכל רגע.
          </p>
          <p>
            <span className="font-semibold text-text-primary">כמו קודם:</span> מתחת לכל תרגיל מופיע מה רשמתם בפעם האחרונה, כדי שיהיה לכם ממה להתקדם.
          </p>
          <p>
            <span className="font-semibold text-text-primary">איך מתקדמים:</span> נשארים באותו משקל ומנסים להוסיף חזרה או שתיים. כשכל הסטים מגיעים לקצה העליון של טווח החזרות, והטכניקה נקייה, מעלים את המשקל במעט.
          </p>
        </div>
      )}
    </div>
  );
}

/** All sets of one exercise, for the workout page. */
export function ExerciseLog({ api: logApi, exerciseId, sets }: { api: WorkoutLogApi; exerciseId: string; sets: number }) {
  const [open, setOpen] = useState(false);
  const numbers = useMemo(() => Array.from({ length: sets }, (_, i) => i + 1), [sets]);
  const filled = numbers.filter((n) => logApi.find(exerciseId, n)).length;
  if (!logApi.log) return null;
  if (!logApi.editable && filled === 0) return null;
  const last = logApi.log.previous.find((p) => p.exerciseId === exerciseId);

  return (
    <div className="px-4 pb-3.5">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-10 w-full items-center justify-between gap-2 rounded-xl bg-white/[0.05] px-3 text-body-md font-semibold transition-colors hover:bg-white/[0.09]">
        <span>{logApi.editable ? "לרשום משקל וחזרות" : "מה רשמתם"}</span>
        <span className="text-label-md font-medium text-text-secondary">{filled > 0 ? `${filled} מתוך ${sets}` : last ? `בפעם הקודמת: ${show(last.sets[0]?.weightKg ?? null, last.sets[0]?.reps ?? null)}` : "לא חובה"}</span>
      </button>
      {open && (
        <div className="ff-fade-in mt-3 flex flex-col gap-2.5">
          {numbers.map((n) => (logApi.editable ? <SetRow key={n} api={logApi} exerciseId={exerciseId} setNumber={n} /> : <ReadOnlySet key={n} api={logApi} exerciseId={exerciseId} setNumber={n} />))}
          {logApi.editable && <LogHelp />}
        </div>
      )}
    </div>
  );
}

function ReadOnlySet({ api: logApi, exerciseId, setNumber }: { api: WorkoutLogApi; exerciseId: string; setNumber: number }) {
  const set = logApi.find(exerciseId, setNumber);
  return (
    <p className="flex items-center gap-3 text-body-md">
      <span className="w-11 shrink-0 font-semibold text-text-secondary">סט {setNumber}</span>
      <span dir="ltr" className="tabular-nums">
        {set ? show(set.weightKg, set.reps) || "—" : "—"}
      </span>
    </p>
  );
}
