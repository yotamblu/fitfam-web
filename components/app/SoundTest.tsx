"use client";

import { useState } from "react";
import { audioStatus, sfx, testVariant } from "@/lib/sfx";

const VARIANTS = [
  { kind: "pool", label: "בדיקה א׳" },
  { kind: "fresh", label: "בדיקה ב׳" },
  { kind: "webaudio", label: "בדיקה ג׳" },
] as const;

/** Plays a sample and shows what the sound engine reports, so a silent phone can be diagnosed from the screen. */
export default function SoundTest() {
  const [lines, setLines] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          // let the silent unlock clips finish first so the chime does not cut one off
          window.setTimeout(() => sfx.correct(), 250);
          window.setTimeout(() => setLines([audioStatus()]), 1000);
        }}
        className="self-start rounded-xl bg-white/[0.07] px-4 py-2.5 text-body-md font-semibold transition-colors hover:bg-white/[0.11]"
      >
        בדיקת צליל
      </button>
      <p className="text-label-md text-text-secondary">אם אין צליל, לחצו על כל אחת מהבדיקות ואמרו איזו השמיעה:</p>
      <div className="flex flex-wrap gap-2">
        {VARIANTS.map((variant) => (
          <button
            key={variant.kind}
            type="button"
            onClick={() => {
              void testVariant(variant.kind).then((text) => setLines((old) => [`${variant.label}: ${text}`, ...old].slice(0, 4)));
            }}
            className="rounded-xl bg-white/[0.07] px-4 py-2.5 text-body-md font-semibold transition-colors hover:bg-white/[0.11]"
          >
            {variant.label}
          </button>
        ))}
      </div>
      {lines.map((line, i) => (
        <p key={i} dir="rtl" className="text-label-md leading-5 text-text-secondary">
          {line}
        </p>
      ))}
    </div>
  );
}
