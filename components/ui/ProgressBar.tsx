/** Thin progress bar; the fill animates only `transform`. */
export default function ProgressBar({
  value,
  max,
  tone = "ember",
  label,
}: {
  value: number;
  max: number;
  tone?: "ember" | "volt";
  label: string;
}) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-2 w-full overflow-hidden rounded-full bg-well"
    >
      <div
        className={`h-full w-full origin-right rounded-full transition-transform duration-500 ${
          tone === "volt" ? "bg-volt" : "bg-ember"
        }`}
        style={{ transform: `scaleX(${ratio})` }}
      />
    </div>
  );
}
