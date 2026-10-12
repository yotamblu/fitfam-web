"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { ChevronRightIcon } from "./icons";
import type { Theme } from "./RoadmapScenery";
import SoundToggle from "./SoundToggle";
import VenueBackdrop from "./VenueBackdrop";

/**
 * Colours the iOS status strip and the browser theme colour while a themed page is open, then puts the old ones back.
 * Used by every page that wears a venue (the workout page, the player, the exercise page).
 */
export function useVenueTint(theme: Theme | null) {
  const colour = theme?.chrome ?? null;
  useEffect(() => {
    if (!colour) return;
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previous = meta?.content;
    root.style.setProperty("--chrome-tint", colour);
    if (meta) meta.content = colour;
    return () => {
      root.style.removeProperty("--chrome-tint");
      if (meta && previous) meta.content = previous;
    };
  }, [colour]);
}

/**
 * Full-screen page without the tab bar: a back link, a title and the content (workout page, results). Scales up on wide
 * screens. With a `theme` the page is painted as the venue of its level (a running workout sits on the track).
 */
export default function StackShell({
  title,
  backHref,
  backLabel = "חזרה",
  theme = null,
  children,
}: {
  title: string;
  backHref: string;
  backLabel?: string;
  theme?: Theme | null;
  children: ReactNode;
}) {
  useVenueTint(theme);
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {theme ? (
        <VenueBackdrop theme={theme} />
      ) : (
        // a plain static fade from the status-strip colour into the page
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-status-tint/55 to-transparent" />
      )}

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col lg:max-w-5xl">
        <header className="flex items-center gap-2 px-gutter pt-[calc(env(safe-area-inset-top)+14px)] pb-3 lg:px-10 lg:pt-8">
          <Link
            href={backHref}
            className="-ms-2 flex h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-body-md font-semibold text-text-primary/90 transition-colors hover:bg-white/[0.08]"
          >
            <ChevronRightIcon className="size-5" />
            {backLabel}
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-heading text-body-md font-medium text-text-secondary [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">{title}</h1>
          <SoundToggle />
        </header>

        <main className="ff-fade-in flex flex-1 flex-col gap-6 px-gutter pt-2 pb-[calc(env(safe-area-inset-bottom)+32px)] lg:px-10">{children}</main>
      </div>
    </div>
  );
}
