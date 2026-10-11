"use client";

import { useSession } from "./Session";

/**
 * The game-style top menu of the roadmap: chunky plan buttons (the only place plans are switched). It lives in the
 * app header on phones and sticks to the top of the content on wide screens, in the colours of the venue below it.
 */
export default function RoadmapHud({ className = "" }: { className?: string }) {
  const { plans, activePlan, setActiveSlug } = useSession();


  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="התוכניות שלי">
        {plans.map((plan) => {
          const selected = plan.planSlug === activePlan?.planSlug;
          return (
            <button
              key={plan.planSlug}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveSlug(plan.planSlug)}
              className={`h-9 shrink-0 rounded-full border-[3px] px-4 font-heading text-[13px] font-extrabold transition active:translate-y-[3px] ${
                selected
                  ? "border-white text-[#1a1208] shadow-[0_4px_0_rgba(0,0,0,0.4)]"
                  : "border-white/45 bg-black/30 text-white/85 shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:bg-black/45"
              }`}
              style={selected ? { backgroundColor: "var(--chrome-accent)" } : undefined}
            >
              {plan.planNameHe}
            </button>
          );
        })}
      </div>
    </div>
  );
}
