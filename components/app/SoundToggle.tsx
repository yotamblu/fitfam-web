"use client";

import { useState } from "react";
import { isMuted, setMuted, sfx } from "@/lib/sfx";
import { SpeakerIcon, SpeakerOffIcon } from "./icons";

/** Sound on / off. The choice is remembered on this device. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const [muted, setState] = useState(() => isMuted());
  return (
    <button
      type="button"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setState(next);
        if (!next) {
          sfx.unlock();
          sfx.correct();
        }
      }}
      aria-pressed={!muted}
      aria-label={muted ? "הפעלת צלילים" : "השתקת צלילים"}
      className={`flex size-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary ${className}`}
    >
      {muted ? <SpeakerOffIcon className="size-5" /> : <SpeakerIcon className="size-5" />}
    </button>
  );
}
