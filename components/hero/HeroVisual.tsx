import WindingMap from "./WindingMap";

export default function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative h-[290px] w-full shrink-0 max-w-sm overflow-hidden rounded-2xl border border-border bg-roadmap-canvas/80 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
    >
      <WindingMap />
    </div>
  );
}
