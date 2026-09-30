"use client";

import { useState } from "react";
import PerspectiveRoad from "./PerspectiveRoad";
import UnlockList from "./UnlockList";
import WindingMap from "./WindingMap";

const DESIGNS = [
  { id: "a", label: "א׳ מפה", Visual: WindingMap },
  { id: "b", label: "ב׳ פתיחת שבועות", Visual: UnlockList },
  { id: "c", label: "ג׳ כביש", Visual: PerspectiveRoad },
] as const;

// The design switcher is a temporary tool for choosing a direction; remove it once one is picked.
export default function HeroVisual() {
  const [id, setId] = useState<(typeof DESIGNS)[number]["id"]>("a");
  const { Visual } = DESIGNS.find((d) => d.id === id)!;

  return (
    <div className="w-full max-w-sm">
      <div
        aria-hidden="true"
        className="relative h-[290px] overflow-hidden rounded-2xl border border-border bg-roadmap-canvas/80 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
      >
        <Visual key={id} />
      </div>
      <div role="tablist" aria-label="בחירת עיצוב" className="mt-2 flex justify-center gap-1.5">
        {DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === id}
            onClick={() => setId(d.id)}
            className={`rounded-full border px-3 py-1 text-label-md font-semibold transition ${
              d.id === id ? "border-ember bg-ember/15 text-ember" : "border-border text-text-muted"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
