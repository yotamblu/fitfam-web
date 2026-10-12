"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCountUp, useInView } from "./hooks";

/** Fades and lifts its children in when they first scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`ff-reveal ${seen ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** A card-coloured block with a light sweeping over it: the loading look for anything that is still arriving. */
export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" className={`ff-skeleton ${className}`} style={style} />;
}

/** A number that counts up when it appears. */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const shown = useCountUp(value);
  return (
    <span dir="ltr" className={`tabular-nums ${className}`}>
      {shown.toLocaleString("en-US")}
    </span>
  );
}

/** A circular progress ring around its children (the XP ring around the avatar and level number). */
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  tone = "ember",
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  tone?: "ember" | "volt";
  children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = tone === "volt" ? "var(--color-volt)" : "var(--color-ember)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border-emphasis)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, value)))}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** A burst of falling pieces for big moments (level up, finished workout). Pure CSS, a few dozen spans. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(() => {
    const colors = ["var(--color-ember)", "var(--color-volt)", "var(--color-info)", "#fafafa"];
    // deterministic spread, so server and client render the same markup
    return Array.from({ length: pieces }, (_, i) => {
      const angle = (i / pieces) * Math.PI * 2;
      const power = 120 + ((i * 37) % 160);
      return {
        key: i,
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power * 0.7 + 140 + ((i * 53) % 120),
        r: ((i * 97) % 720) - 360,
        delay: (i % 6) * 40,
        color: colors[i % colors.length],
        size: 6 + (i % 4) * 2,
      };
    });
  }, [pieces]);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/3 z-30 flex justify-center">
      {items.map((p) => (
        <span
          key={p.key}
          className="absolute rounded-[2px]"
          style={
            {
              width: p.size,
              height: p.size * 1.6,
              backgroundColor: p.color,
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              "--r": `${p.r}deg`,
              animation: `ff-confetti 1.8s cubic-bezier(0.2, 0.7, 0.3, 1) ${p.delay}ms both`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** The branded full-screen loader: the logo with a pulsing ring and a sweeping bar. */
export function BrandLoader({ label = "טוען" }: { label?: string }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-gutter">
      <div className="relative flex size-28 items-center justify-center">
        <span aria-hidden="true" className="ff-ring absolute inset-0 rounded-full border-2 border-ember/60" />
        <span aria-hidden="true" className="ff-ring absolute inset-0 rounded-full border-2 border-ember/40 [animation-delay:1.2s]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-transparent.png" alt="FitFam" className="relative h-16 w-auto ff-pop-in" />
      </div>
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
        <div aria-hidden="true" className="ff-skeleton h-1.5 w-40 !rounded-full" />
        <p className="text-body-md text-text-secondary ff-pulse-soft">{label}...</p>
      </div>
    </main>
  );
}

/** Renders full-screen layers (level-up, exercise page) straight into <body>, so no transformed, clipped or stacked ancestor can offset them. */
export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
