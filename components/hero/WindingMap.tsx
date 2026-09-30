import { WEEKS, pad, type Week } from "./weeks";
import { BoltIcon, CheckIcon, LockIcon } from "./icons";

// Design A: the serpentine roadmap. The trail draws itself, the weeks pop in
// one by one, then the "camera" glides down the path to the locked weeks.
const VB_W = 360;
const VB_H = 600;
const POINTS = [
  { x: 290, y: 50 },
  { x: 70, y: 160 },
  { x: 290, y: 270 },
  { x: 70, y: 380 },
  { x: 290, y: 490 },
];
const FULL =
  "M 290,50 C 290,105 70,105 70,160 C 70,215 290,215 290,270 C 290,325 70,325 70,380 C 70,435 290,435 290,490";
const DONE = "M 290,50 C 290,105 70,105 70,160 C 70,215 290,215 290,270";

function Node({ week, i }: { week: Week; i: number }) {
  const { x, y } = POINTS[i];
  const onRight = x > VB_W / 2;
  const edge = `calc(${((onRight ? VB_W - x : x) / VB_W) * 100}% - 24px)`;
  const done = week.status === "done";
  const active = week.status === "active";

  const badge = (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl border ${
        done
          ? "size-12 border-roadmap-volt bg-roadmap-volt text-roadmap-canvas"
          : active
            ? "size-14 border-roadmap-ember bg-roadmap-ember text-roadmap-canvas shadow-glow-ember"
            : "size-12 border-border-emphasis bg-surface-raised text-text-muted"
      }`}
    >
      {active && <span className="animate-beacon absolute inset-0 rounded-xl border-2 border-roadmap-ember" />}
      {done ? <CheckIcon /> : active ? <BoltIcon className="size-6" /> : <LockIcon />}
      <span className="absolute -bottom-1.5 -left-1.5 rounded border border-border bg-roadmap-surface px-1 font-heading text-[9px] font-black text-text-secondary">
        {pad(week.n)}
      </span>
    </div>
  );

  const label = (
    <div className={`w-28 ${done || active ? "" : "opacity-60"}`}>
      <div className="flex items-center gap-1.5">
        <span className="font-heading text-body-md font-extrabold text-white">שבוע {pad(week.n)}</span>
        {done && (
          <span className="rounded border border-roadmap-volt/30 bg-roadmap-volt/10 px-1 font-heading text-[10px] font-bold text-roadmap-volt">
            הושלם
          </span>
        )}
      </div>
      <div className="text-label-md leading-4 text-text-secondary">{week.title}</div>
      {active && (
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-well">
          <div className="h-full w-1/2 rounded-full bg-roadmap-ember" />
        </div>
      )}
    </div>
  );

  return (
    <div
      className="animate-node-in absolute flex -translate-y-1/2 items-center gap-3"
      style={{
        top: `${(y / VB_H) * 100}%`,
        [onRight ? "right" : "left"]: edge,
        animationDelay: `${0.5 + i * 0.45}s`,
      }}
    >
      {onRight ? (
        <>
          {badge}
          {label}
        </>
      ) : (
        <>
          {label}
          {badge}
        </>
      )}
    </div>
  );
}

export default function WindingMap() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-pan absolute inset-x-0 top-0 aspect-[360/600] w-full">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <mask id="wm-reveal">
              <path d={DONE} pathLength={1} fill="none" stroke="white" strokeWidth="10" style={{ strokeDasharray: 1 }} className="animate-reveal" />
            </mask>
          </defs>
          <path d={FULL} fill="none" stroke="#27272a" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />
          <path d={DONE} fill="none" stroke="#bef264" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" mask="url(#wm-reveal)" />
        </svg>
        {WEEKS.map((w, i) => (
          <Node key={w.n} week={w} i={i} />
        ))}
      </div>
    </div>
  );
}
