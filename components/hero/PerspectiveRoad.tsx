// Design C: the plan as a road running off into the distance. The dashes flow
// toward you and a beacon travels the route, week pads light up along the way.
const ROAD =
  "M 200,660 L 200,590 C 200,530 130,530 130,470 C 130,410 230,410 230,350 C 230,290 140,290 140,230 C 140,170 200,170 200,110 L 200,20";
const DONE_ROAD = "M 200,660 L 200,590 C 200,530 130,530 130,470 C 130,410 230,410 230,350";

const PADS = [
  { n: "01", x: 200, y: 590, s: "done" },
  { n: "02", x: 130, y: 470, s: "done" },
  { n: "03", x: 230, y: 350, s: "active" },
  { n: "04", x: 140, y: 230, s: "locked" },
  { n: "05", x: 200, y: 110, s: "locked" },
] as const;

export default function PerspectiveRoad() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-x-0 bottom-[-30px] aspect-[360/680] w-full"
        style={{ transform: "perspective(480px) rotateX(58deg)", transformOrigin: "50% 100%" }}
      >
        <svg viewBox="0 0 360 680" className="size-full" aria-hidden="true">
          <path d={ROAD} fill="none" stroke="#27272a" strokeWidth="76" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROAD} fill="none" stroke="#131314" strokeWidth="68" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROAD} fill="none" stroke="#3f3f46" strokeWidth="3" strokeDasharray="13 13" className="animate-road" />
          <path d={DONE_ROAD} fill="none" stroke="#bef264" strokeWidth="3" strokeDasharray="13 13" className="animate-road" />

          {PADS.map((p) => (
            <g key={p.n} transform={`translate(${p.x} ${p.y})`}>
              {p.s === "active" && (
                <rect x="-30" y="-30" width="60" height="60" rx="14" fill="none" stroke="#ff4322" strokeWidth="2">
                  <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="scale" values="1;1.7" dur="2s" repeatCount="indefinite" />
                </rect>
              )}
              <rect
                x="-26"
                y="-26"
                width="52"
                height="52"
                rx="12"
                fill={p.s === "done" ? "#bef264" : p.s === "active" ? "#ff4322" : "#18181b"}
                stroke={p.s === "locked" ? "#3f3f46" : "none"}
                strokeWidth="2"
              />
              {p.s === "done" ? (
                <path d="M -11,0 L -3,9 L 12,-9" fill="none" stroke="#0a0a0b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <text y="9" textAnchor="middle" fontSize="26" fontWeight="900" fill={p.s === "active" ? "#0a0a0b" : "#71717a"} style={{ fontFamily: "var(--font-heebo)" }}>
                  {p.n}
                </text>
              )}
            </g>
          ))}

          <circle r="9" fill="#ff4322">
            <animateMotion dur="7s" repeatCount="indefinite" path={ROAD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        </svg>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-canvas via-canvas/70 to-transparent" />
    </div>
  );
}
