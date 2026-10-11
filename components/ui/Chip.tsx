import type { ReactNode } from "react";

type Tone = "neutral" | "ember" | "volt" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/[0.07] text-text-secondary",
  ember: "bg-ember/15 text-ember",
  volt: "bg-volt/15 text-volt",
  info: "bg-info/15 text-info",
};

/** Small read-only label. */
export default function Chip({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-label-md font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
