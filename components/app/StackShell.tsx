"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

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
      {/* a plain static fade from the status-strip colour into the page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-status-tint/55 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col lg:max-w-5xl">
        <header className="flex items-center gap-2 px-gutter pt-[calc(env(safe-area-inset-top)+14px)] pb-3 lg:px-10 lg:pt-8">
          <Link
            href={backHref}
            className="-ms-2 flex h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-body-md font-semibold text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
          >
            <ChevronRightIcon className="size-5" />
            {backLabel}
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-end font-heading text-body-md font-medium text-text-muted">{title}</h1>
        </header>

        <main className="ff-fade-in flex flex-1 flex-col gap-6 px-gutter pt-2 pb-[calc(env(safe-area-inset-bottom)+32px)] lg:px-10">{children}</main>
      </div>
    </div>
  );
}
