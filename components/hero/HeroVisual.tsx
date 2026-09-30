import WindingMap from "./WindingMap";

// The top/bottom fades are plain gradient overlays, not `mask-image`: a mask over animated children
// forces a re-mask every frame, which is very janky on iOS Safari.
export default function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative h-[290px] w-full shrink-0 max-w-sm overflow-hidden rounded-2xl border border-border bg-roadmap-canvas"
    >
      <WindingMap />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-roadmap-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-roadmap-canvas to-transparent" />
    </div>
  );
}
