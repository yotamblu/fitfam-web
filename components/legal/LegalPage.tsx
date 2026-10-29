import Link from "next/link";
import type { ReactNode } from "react";

/** Page shell for the public legal documents (terms, privacy). Server component: no scripts needed. */
export default function LegalPage({ title, version, children }: { title: string; version: string; children: ReactNode }) {
  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-2xl px-gutter pb-24 pt-[max(3.5rem,env(safe-area-inset-top))]">
      {/* top-edge rule: meet the iOS status strip with no hard edge */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-status-tint via-status-tint/60 to-transparent" />
      <div className="relative">
        <Link href="/" className="text-body-md text-text-secondary hover:text-text-primary">
          ← חזרה ל-FitFam
        </Link>
        <h1 className="mt-6 font-heading text-[32px] font-bold leading-10">{title}</h1>
        <p className="mt-1 text-label-md text-text-muted">
          גרסה <span dir="ltr">{version}</span>
        </p>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-headline-sm font-bold">{title}</h2>
      <div className="flex flex-col gap-3 text-body-lg leading-7 text-text-secondary">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 ps-6">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
