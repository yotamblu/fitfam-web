"use client";

import { useEffect, useState } from "react";
import { WEEKS, pad } from "./weeks";
import { BoltIcon, CheckIcon, LockIcon } from "./icons";

// Design B: weeks unlock one after another on a loop. Points tick up with each win.
export default function UnlockList() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s >= WEEKS.length ? 0 : s + 1)), 1500);
    return () => clearInterval(id);
  }, []);

  const total = WEEKS.slice(0, step).reduce((sum, w) => sum + w.pts, 0);

  return (
    <div className="absolute inset-0 flex flex-col gap-2 p-1">
      <div className="flex items-center justify-between rounded-xl border border-border bg-roadmap-surface px-3 py-2">
        <div className="text-label-md text-text-secondary">
          שבוע <span dir="ltr" className="font-heading font-bold text-white">{pad(Math.min(step + 1, WEEKS.length))}</span> מתוך{" "}
          <span dir="ltr" className="font-heading font-bold text-white">12</span>
        </div>
        <div dir="ltr" className="font-heading text-body-lg font-black tabular-nums text-roadmap-volt">
          {total.toLocaleString("en-US")} <span className="text-label-md font-bold text-text-muted">PTS</span>
        </div>
      </div>

      <ol className="relative flex flex-1 flex-col justify-between">
        <span aria-hidden="true" className="absolute inset-y-4 right-[22px] w-0.5 bg-border" />
        <span
          aria-hidden="true"
          className="absolute right-[22px] top-4 w-0.5 bg-roadmap-volt transition-all duration-700"
          style={{ height: `${(Math.min(step, WEEKS.length - 1) / (WEEKS.length - 1)) * 100 - 6}%` }}
        />
        {WEEKS.map((w, i) => {
          const state = i < step ? "done" : i === step ? "active" : "locked";
          return (
            <li
              key={w.n}
              className={`relative flex items-center gap-3 rounded-xl border px-2 py-1.5 transition-all duration-500 ${
                state === "active"
                  ? "scale-[1.02] border-roadmap-ember/50 bg-roadmap-surface shadow-glow-ember"
                  : state === "done"
                    ? "border-roadmap-volt/25 bg-roadmap-surface"
                    : "border-border bg-surface opacity-55"
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-500 ${
                  state === "done"
                    ? "bg-roadmap-volt text-roadmap-canvas"
                    : state === "active"
                      ? "bg-roadmap-ember text-roadmap-canvas"
                      : "bg-surface-raised text-text-muted"
                }`}
              >
                {state === "done" ? <CheckIcon className="size-4" /> : state === "active" ? <BoltIcon className="size-4" /> : <LockIcon className="size-3.5" />}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="font-heading text-body-md font-extrabold text-white">שבוע {pad(w.n)}</div>
                <div className="truncate text-label-md text-text-secondary">{w.title}</div>
              </div>
              <span
                dir="ltr"
                className={`font-heading text-label-md font-bold tabular-nums transition-opacity duration-500 ${
                  state === "done" ? "text-roadmap-volt opacity-100" : "opacity-0"
                }`}
              >
                +{w.pts.toLocaleString("en-US")}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
