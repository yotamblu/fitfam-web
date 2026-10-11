"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Full-screen page without the tab bar: a back link, a title and the content (workout page, results). Scales up on wide screens. */
export default function StackShell({
  title,
  backHref,
  backLabel = "חזרה",
  children,
}: {
  title: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <div className="absolute -top-44 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-ember/15 blur-[120px]" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-status-tint via-status-tint/60 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col lg:max-w-5xl">
        <header className="flex items-center gap-3 px-gutter pt-[calc(env(safe-area-inset-top)+16px)] pb-3 lg:px-10 lg:pt-8">
          <Link
            href={backHref}
            className="shrink-0 rounded-full border border-border-emphasis bg-surface-raised/80 px-4 py-2 text-body-md font-semibold backdrop-blur-md transition hover:border-ember/60 hover:text-ember"
          >
            → {backLabel}
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-heading text-body-lg font-bold text-text-secondary">{title}</h1>
        </header>

        <main className="ff-fade-in flex flex-1 flex-col gap-5 px-gutter pt-2 pb-[calc(env(safe-area-inset-bottom)+32px)] lg:px-10">{children}</main>
      </div>
    </div>
  );
}
