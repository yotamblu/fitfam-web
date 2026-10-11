import type { ReactNode } from "react";

// The few building blocks every signed-in screen is made of. One surface tone, one radius, hairline dividers instead of
// boxes inside boxes, so the hierarchy comes from type size and spacing rather than from decoration.

/** A raised surface. No border, no glow: it separates from the page by tone alone. */
export function Card({ children, className = "", as: Tag = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "aside" | "li" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-2xl bg-surface-raised ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** A section heading with an optional value on the other side (e.g. "השבוע" and "2 מתוך 3"). */
export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-heading text-body-lg font-bold">{children}</h2>
      {aside && <span className="text-body-md text-text-secondary">{aside}</span>}
    </div>
  );
}

/** Rows separated by hairlines inside one surface: the grouped-list pattern of iOS and most fitness apps. */
export function RowList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ul className={`divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-surface-raised ${className}`}>{children}</ul>;
}

/** Small supporting facts on one line, separated by dots: "אימון 3 מתוך 5 · 45 דק׳ · ריצה". */
export function Meta({ items, className = "" }: { items: (string | null | undefined | false)[]; className?: string }) {
  const shown = items.filter(Boolean) as string[];
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-body-md text-text-secondary ${className}`}>
      {shown.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="size-[3px] rounded-full bg-text-muted" />}
          {item}
        </span>
      ))}
    </p>
  );
}

/** A big number with a quiet label under it. */
export function Figure({ value, label, tone = "text-text-primary" }: { value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span dir="ltr" className={`text-start font-heading text-headline-md font-bold tabular-nums ${tone}`}>
        {value}
      </span>
      <span className="text-label-md text-text-secondary">{label}</span>
    </div>
  );
}
