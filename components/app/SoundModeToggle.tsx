"use client";

import { useState } from "react";
import { isPolite, setPolite, sfx } from "@/lib/sfx";

/**
 * "Also play when the phone is on silent". On (the default), sounds are always heard, even with the silent switch on,
 * but they may pause music playing in the background. Off ("polite"), the silent switch is respected and music is left alone.
 */
export default function SoundModeToggle() {
  const [always, setAlways] = useState(() => !isPolite());
  return (
    <button
      type="button"
      role="switch"
      aria-checked={always}
      onClick={() => {
        const next = !always;
        setAlways(next);
        setPolite(!next);
        sfx.unlock();
        sfx.correct();
      }}
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-white/[0.04]"
    >
      <span className="flex flex-col">
        <span className="text-body-lg">גם במצב שקט</span>
        <span className="text-label-md text-text-secondary">{always ? "הצלילים נשמעים תמיד, ועלולים לעצור מוזיקה ברקע" : "מכבדים את מתג ההשתקה ולא מפריעים למוזיקה"}</span>
      </span>
      <span aria-hidden="true" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${always ? "bg-ember" : "bg-white/15"}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white transition-all duration-200 ${always ? "start-6" : "start-1"}`} />
      </span>
    </button>
  );
}
