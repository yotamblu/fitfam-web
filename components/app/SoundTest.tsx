"use client";

import { useState } from "react";
import { audioStatus, sfx } from "@/lib/sfx";

/** Plays a sample and shows what the sound engine reports, so a silent phone can be diagnosed from the screen. */
export default function SoundTest() {
  const [status, setStatus] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <button
        type="button"
        onClick={() => {
          sfx.unlock();
          // let the silent unlock clips finish first so the chime does not cut one off
          window.setTimeout(() => sfx.correct(), 250);
          window.setTimeout(() => setStatus(audioStatus()), 1000);
        }}
        className="self-start rounded-xl bg-white/[0.07] px-4 py-2.5 text-body-md font-semibold transition-colors hover:bg-white/[0.11]"
      >
        בדיקת צליל
      </button>
      {status && (
        <p dir="rtl" className="text-label-md leading-5 text-text-secondary">
          {status}
        </p>
      )}
    </div>
  );
}
