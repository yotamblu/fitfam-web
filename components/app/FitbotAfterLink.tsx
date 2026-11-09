"use client";

import Link from "next/link";
import FitbotLogo from "./FitbotLogo";
import { ChevronLeftIcon } from "./icons";
import { useSession } from "./Session";

/** "Talk to Fitbot about this workout", shown where a workout ends. Hidden when Fitbot is not open to this customer. */
export default function FitbotAfterLink({ workoutId, className = "" }: { workoutId: string; className?: string }) {
  const { fitbot } = useSession();
  if (!fitbot?.available) return null;
  return (
    <Link
      href={`/fitbot/after/${workoutId}`}
      className={`flex items-center gap-3 rounded-xl bg-white/[0.07] px-4 py-3 text-start transition-colors hover:bg-white/[0.11] active:scale-[0.99] ${className}`}
    >
      <FitbotLogo className="size-10" />
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-body-lg font-bold">לדבר עם Fitbot על האימון</span>
        <span className="block text-label-md text-text-secondary">איך היה, מה לשים לב ומה הלאה</span>
      </span>
      <ChevronLeftIcon className="size-5 shrink-0 text-text-muted" />
    </Link>
  );
}
