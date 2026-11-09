"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { tourSteps } from "@/lib/tour";
import Button from "../ui/Button";
import FitbotLogo from "./FitbotLogo";
import { useSession } from "./Session";

type Box = { top: number; left: number; width: number; height: number };

const PAD = 8; // breathing room around the highlighted element

function inRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * The first-run tour. A dimmed screen with a ring around the element being explained and Fitbot's card on the side of
 * the screen with more room. It moves between the tabs itself, can be skipped at any moment (Escape too), and what it
 * measures is re-read continuously, so scrolling, resizing and late-loading content keep the ring in place.
 */
export default function Tour() {
  const { fitbot, pace, endTour } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasPaces = Boolean(pace && (pace.needed || pace.fiveKSec !== null));
  const hasFitbot = Boolean(fitbot?.available);
  const steps = useMemo(() => tourSteps({ fitbotTab: hasFitbot, paces: hasPaces }), [hasFitbot, hasPaces]);
  const [index, setIndex] = useState(0);
  // the measured box belongs to one step; a box left over from the previous step is ignored
  const [measured, setMeasured] = useState<{ id: string; box: Box } | null>(null);

  const step = steps[Math.min(index, steps.length - 1)];
  const last = index >= steps.length - 1;
  const onRoute = inRoute(pathname, step.route);
  const box = measured && measured.id === step.id ? measured.box : null;

  // open the tab the step belongs to
  useEffect(() => {
    if (!onRoute) router.push(step.route);
  }, [onRoute, router, step.route]);

  // find the target, bring it on screen once, and keep measuring it
  useEffect(() => {
    if (!step.target || !onRoute) return;
    let scrolled = false;
    const measure = () => {
      const node = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`)).find((n) => n.getClientRects().length > 0);
      if (!node) return;
      if (!scrolled) {
        scrolled = true;
        const tall = node.getBoundingClientRect().height > window.innerHeight * 0.45;
        node.scrollIntoView({ block: tall ? "start" : "center" });
        if (tall) window.scrollBy(0, -90);
      }
      const r = node.getBoundingClientRect();
      const next = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
      setMeasured((prev) => {
        const b = prev?.box;
        return prev && prev.id === step.id && b && b.top === next.top && b.left === next.left && b.width === next.width && b.height === next.height ? prev : { id: step.id, box: next };
      });
    };
    measure();
    const timer = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step.id, step.target, onRoute]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") endTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [endTour]);

  const next = () => {
    if (last) {
      endTour();
      router.push("/roadmap");
    } else {
      setIndex((i) => i + 1);
    }
  };

  // the card goes to the half of the screen that does not hold the target; without a target it sits in the middle
  const targetLow = box ? box.top + box.height / 2 > window.innerHeight / 2 : false;
  const place = !box ? "justify-center" : targetLow ? "justify-start" : "justify-end";

  return (
    <div className="fixed inset-0 z-50 touch-none" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {box ? (
        <div
          aria-hidden="true"
          className="ff-fade-in pointer-events-none fixed rounded-[20px]"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            boxShadow: "0 0 0 100vmax rgba(8,8,10,0.8), 0 0 0 2px var(--color-ember), 0 0 24px rgba(255,86,55,0.55)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(8,8,10,0.8)]" />
      )}

      <div className={`pointer-events-none relative flex h-full flex-col items-center px-gutter pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+12px)] ${place}`}>
        <section key={step.id} className="ff-rise-in pointer-events-auto relative mt-9 w-full max-w-md rounded-3xl border border-white/15 bg-surface-raised px-5 pt-12 pb-4 shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
          <div className="ff-bob absolute -top-9 left-1/2 -ml-9">
            <FitbotLogo className="size-[72px]" priority />
          </div>
          <button type="button" onClick={endTour} className="absolute end-3 top-3 rounded-lg px-2 py-1 text-label-md font-semibold text-text-muted transition hover:text-text-primary">
            דילוג
          </button>
          <h2 id="tour-title" className="text-center font-heading text-headline-sm font-bold">
            {step.title}
          </h2>
          <p className="mt-2 text-center text-body-md text-text-secondary">{step.body}</p>

          <ol className="mt-4 flex justify-center gap-1.5" aria-label={`שלב ${index + 1} מתוך ${steps.length}`}>
            {steps.map((s, i) => (
              <li key={s.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-ember" : "w-1.5 bg-white/20"}`} />
            ))}
          </ol>

          <div className="mt-4 flex items-center gap-2">
            {index > 0 && (
              <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                הקודם
              </Button>
            )}
            <Button autoFocus fullWidth onClick={next}>
              {last ? "בואו נתחיל" : index === 0 ? "יאללה, מתחילים" : "הבא"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
