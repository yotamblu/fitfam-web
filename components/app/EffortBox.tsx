import { splitEffort } from "@/lib/training";

/**
 * The effort target of a block ("how many reps should be left before failure"), set apart so it is not skipped.
 * Coaches write it as the block note "יעד המאמץ: <target>. <explanation>"; any other note is shown as plain text.
 */
export default function EffortBox({ notes, centered = false, className = "" }: { notes: string; centered?: boolean; className?: string }) {
  const effort = splitEffort(notes);
  if (!effort) return <p className={`text-body-md text-text-secondary ${className}`}>{notes}</p>;
  return (
    <div className={`rounded-2xl border-s-4 border-ember bg-ember/10 p-4 ${centered ? "text-center" : ""} ${className}`}>
      <p className="text-body-md font-semibold text-ember">יעד המאמץ</p>
      <p className="mt-1 font-heading text-[30px] font-bold leading-10">{effort.goal}</p>
      {effort.explanation && <p className="mt-2 text-body-lg text-text-secondary">{effort.explanation}</p>}
    </div>
  );
}
