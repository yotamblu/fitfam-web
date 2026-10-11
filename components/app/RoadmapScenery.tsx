// The painted world behind the roadmap: a training venue per plan (running track, swimming pool, gym, outdoor park) and
// a time of day per level (day, sunset, night), all drawn as top-down SVG in the map's own coordinate system so it scales
// with the road. Everything is generated from code: no image files.

import type { ReactNode } from "react";
import type { Sport } from "@/lib/api";

export type Venue = "track" | "pool" | "gym" | "park";
export type Variant = 0 | 1 | 2; // day, sunset, night

export type Theme = {
  venue: Venue;
  variant: Variant;
  /** vertical base gradient of the zone: top, middle, bottom */
  sky: [string, string, string];
  roadEdge: string;
  roadInner: string;
  roadStripe: string;
  ribbon: [string, string];
  ribbonText: string;
  done: string;
  doneDark: string;
  locked: string;
  lockedDark: string;
  /** colour of the app bars (top bar, status strip, bottom bar) while this zone is on screen, and the active-tab accent */
  chrome: string;
  accent: string;
};

const VENUE_OF_SPORT: Record<Sport, Venue> = { running: "track", swimming: "pool", gym: "gym", calisthenics: "park" };

/** The venue of a level: the one for the sport most of its workouts are tagged with (null while it has no workouts). */
export function dominantVenue(sports: Sport[]): Venue | null {
  if (sports.length === 0) return null;
  const counts = new Map<Sport, number>();
  for (const sport of sports) counts.set(sport, (counts.get(sport) ?? 0) + 1);
  let best: Sport = sports[0];
  for (const [sport, n] of counts) if (n > (counts.get(best) ?? 0)) best = sport;
  return VENUE_OF_SPORT[best];
}

const GROUND: Record<Venue, [string, string, string][]> = {
  track: [
    ["#4cb66a", "#3a9d5a", "#2f8a4c"],
    ["#9aae45", "#7c9a3c", "#667f30"],
    ["#183a27", "#10281d", "#0b1c14"],
  ],
  pool: [
    ["#58d2f0", "#2fb4e0", "#1b8fd1"],
    ["#3c8fc4", "#2a6fa8", "#1c4f86"],
    ["#0c3a72", "#082a58", "#051c3e"],
  ],
  gym: [
    ["#d9b27a", "#c9a26b", "#b78d57"],
    ["#7b7d88", "#6a6c77", "#575963"],
    ["#12151c", "#0c0e14", "#07080c"],
  ],
  park: [
    ["#6ccb6c", "#58b95a", "#46a24c"],
    ["#a8b24a", "#8aa03e", "#728a33"],
    ["#14352a", "#0f2a20", "#0a1d16"],
  ],
};

const ROAD: Record<Venue, { edge: string; inner: string; stripe: string; ribbon: [string, string]; text: string }> = {
  track: { edge: "#7a2a16", inner: "#fff6dc", stripe: "#ffcf33", ribbon: ["#ff7a45", "#c2381a"], text: "#ffffff" },
  pool: { edge: "#0b4f7a", inner: "#eafcff", stripe: "#7fd8ff", ribbon: ["#34d6ea", "#0e8fb5"], text: "#032b3a" },
  gym: { edge: "#1f222c", inner: "#ececf3", stripe: "#ff7a3d", ribbon: ["#767c96", "#343849"], text: "#ffffff" },
  park: { edge: "#34561a", inner: "#fff6d8", stripe: "#8bd45c", ribbon: ["#5cc45e", "#2b8a3a"], text: "#05310f" },
};

const CHROME: Record<Venue, { bars: [string, string, string]; accent: string }> = {
  track: { bars: ["#5b2316", "#5a2c14", "#1d0c10"], accent: "#ffcf33" },
  pool: { bars: ["#0b3f68", "#123b60", "#06142f"], accent: "#7fd8ff" },
  gym: { bars: ["#4b3820", "#2d2f39", "#080a10"], accent: "#ff7a3d" },
  park: { bars: ["#143f22", "#3a4318", "#07150f"], accent: "#8bd45c" },
};

const NODE: { done: string; doneDark: string; locked: string; lockedDark: string }[] = [
  { done: "#8be04f", doneDark: "#3f8f1c", locked: "#8a9a92", lockedDark: "#58655f" },
  { done: "#ffcf3d", doneDark: "#b8860b", locked: "#a08880", lockedDark: "#6c534c" },
  { done: "#46e6c4", doneDark: "#12907a", locked: "#5d6180", lockedDark: "#383b58" },
];

export function themeFor(venue: Venue, levelIndex: number): Theme {
  const variant = (levelIndex % 3) as Variant;
  const r = ROAD[venue];
  const n = NODE[variant];
  return {
    venue,
    variant,
    sky: GROUND[venue][variant],
    roadEdge: r.edge,
    roadInner: r.inner,
    roadStripe: r.stripe,
    ribbon: r.ribbon,
    ribbonText: r.text,
    chrome: CHROME[venue].bars[variant],
    accent: CHROME[venue].accent,
    ...n,
  };
}

const hash = (n: number, mod: number) => (Math.imul(n + 1, 2654435761) >>> 0) % Math.max(1, mod);
const pick = <T,>(arr: T[], v: number): T => arr[v];

// ---------- small top-down props (centre at 0,0) ----------

const Shadow = ({ rx, ry = rx * 0.6 }: { rx: number; ry?: number }) => <ellipse cx="5" cy="6" rx={rx} ry={ry} fill="#000" opacity="0.22" />;

function Tree({ x, y, s = 1, a, b }: { x: number; y: number; s?: number; a: string; b: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Shadow rx={26} />
      <circle r="24" fill={a} />
      <circle cx="-7" cy="-8" r="13" fill={b} opacity="0.7" />
      <circle cx="9" cy="8" r="9" fill="#000" opacity="0.1" />
    </g>
  );
}

function PullUpBar({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-30" y="-2" width="64" height="10" rx="5" fill="#000" opacity="0.2" />
      <rect x="-30" y="-8" width="60" height="6" rx="3" fill={color} />
      <circle cx="-28" cy="-5" r="6" fill="#d8dce6" />
      <circle cx="28" cy="-5" r="6" fill="#d8dce6" />
    </g>
  );
}

function ParallelBars({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-30" width="6" height="64" rx="3" fill="#000" opacity="0.2" transform="translate(5 5)" />
      <rect x="-18" y="-32" width="6" height="60" rx="3" fill={color} />
      <rect x="12" y="-32" width="6" height="60" rx="3" fill={color} />
      {[-30, 26].map((yy) => (
        <rect key={yy} x="-22" y={yy} width="44" height="5" rx="2.5" fill="#d8dce6" />
      ))}
    </g>
  );
}

function SandPit({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-34" y="-22" width="68" height="44" rx="12" fill="#8a6a3a" />
      <rect x="-30" y="-18" width="60" height="36" rx="9" fill="#e6c98a" />
      <path d="M -20 -4 Q -8 -10 4 -4 T 24 -4 M -22 8 Q -8 2 6 8 T 26 8" stroke="#c9a864" strokeWidth="2" fill="none" />
    </g>
  );
}

function Bench({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-24" y="-6" width="52" height="16" rx="3" fill="#000" opacity="0.2" />
      <rect x="-26" y="-9" width="52" height="16" rx="3" fill="#8a5a30" />
      <path d="M -26 -3 H 26 M -26 3 H 26" stroke="#5e3a1c" strokeWidth="1.4" />
    </g>
  );
}

function Tires({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[[-12, -6], [12, -6], [0, 12]].map(([cx, cy]) => (
        <g key={`${cx}${cy}`}>
          <circle cx={cx + 3} cy={cy + 4} r="14" fill="#000" opacity="0.22" />
          <circle cx={cx} cy={cy} r="14" fill="#2b2b30" />
          <circle cx={cx} cy={cy} r="7" fill="#58b95a" opacity="0.5" />
        </g>
      ))}
    </g>
  );
}

function Lamp({ x, y, color, delay = 0 }: { x: number; y: number; color: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="46" fill={color} opacity="0.18" className="ff-halo" style={{ animationDelay: `${-delay}s`, transformOrigin: "0 0" }} />
      <circle r="22" fill={color} opacity="0.3" />
      <circle r="5" fill="#fff" />
    </g>
  );
}

function Dumbbell({ x, y, s = 1, rot = 0, color }: { x: number; y: number; s?: number; rot?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-18" y="-2" width="42" height="10" rx="4" fill="#000" opacity="0.2" />
      <rect x="-16" y="-3" width="32" height="5" rx="2.5" fill="#cfd3dc" />
      <rect x="-24" y="-9" width="9" height="17" rx="3" fill={color} />
      <rect x="15" y="-9" width="9" height="17" rx="3" fill={color} />
    </g>
  );
}

function Barbell({ x, y, s = 1, rot = 0, color }: { x: number; y: number; s?: number; rot?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-44" y="-1" width="96" height="10" rx="5" fill="#000" opacity="0.2" />
      <rect x="-46" y="-3" width="92" height="5" rx="2.5" fill="#cfd3dc" />
      {[-40, -30, 30, 40].map((px, i) => (
        <rect key={px} x={px - 4} y={i % 2 === 0 ? -15 : -12} width="8" height={i % 2 === 0 ? 30 : 24} rx="3" fill={color} />
      ))}
    </g>
  );
}

function Kettlebell({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="4" cy="5" r="17" fill="#000" opacity="0.22" />
      <circle r="16" fill={color} />
      <circle cx="-5" cy="-6" r="6" fill="#fff" opacity="0.25" />
      <path d="M -9 -13 A 9 9 0 0 1 9 -13" stroke="#cfd3dc" strokeWidth="4" fill="none" />
    </g>
  );
}

function Rack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-26" y="-26" width="58" height="58" rx="4" fill="#000" opacity="0.2" />
      <rect x="-28" y="-28" width="56" height="56" rx="4" fill="none" stroke="#9aa0b4" strokeWidth="5" />
      {[[-28, -28], [28, -28], [-28, 28], [28, 28]].map(([cx, cy]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="6" fill="#3a3e4c" />
      ))}
      <rect x="-36" y="-2" width="72" height="5" rx="2.5" fill="#cfd3dc" />
    </g>
  );
}

function Treadmill({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-16" y="-34" width="38" height="76" rx="6" fill="#000" opacity="0.2" />
      <rect x="-18" y="-36" width="36" height="72" rx="6" fill="#3a3e4c" />
      <rect x="-12" y="-26" width="24" height="52" rx="3" fill="#15171e" />
      <path d="M -12 -14 H 12 M -12 0 H 12 M -12 14 H 12" stroke="#2c303c" strokeWidth="2" />
      <rect x="-14" y="-34" width="28" height="9" rx="3" fill={color} />
    </g>
  );
}

function Mat({ x, y, s = 1, rot = 0, color }: { x: number; y: number; s?: number; rot?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-12" y="-34" width="28" height="72" rx="8" fill="#000" opacity="0.15" />
      <rect x="-14" y="-36" width="28" height="72" rx="8" fill={color} />
      <rect x="-14" y="-36" width="28" height="72" rx="8" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
    </g>
  );
}

function PlateStack({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="4" cy="5" r="20" fill="#000" opacity="0.22" />
      <circle r="19" fill={color} />
      <circle r="12" fill="#1c1f28" opacity="0.5" />
      <circle r="5" fill="#cfd3dc" />
    </g>
  );
}

function Float({ x, y, delay }: { x: number; y: number; delay: number }) {
  return <circle cx={x} cy={y} r="2.6" fill="#fff" opacity="0.75" className="ff-float-up" style={{ animationDelay: `${-delay}s` }} />;
}

// ---------- venues ----------

function track(top: number, bottom: number, w: number, v: Variant, idx: number): ReactNode[] {
  const out: ReactNode[] = [];
  const L = 50;
  const R = w - 50;
  const lanes = 6;
  const laneW = (R - L) / lanes;
  const surface = pick(["#cf5a3f", "#d9693f", "#6e2b30"], v);
  const grassTree = pick([["#2e8b4c", "#5cc477"], ["#6b8a2e", "#a3bf4c"], ["#0d2a1a", "#1d5a3a"]], v);

  out.push(<rect key="surf" x={L} y={top - 40} width={R - L} height={bottom - top + 120} fill={surface} />);
  out.push(<rect key="surf2" x={L} y={top - 40} width={R - L} height={bottom - top + 120} fill="#fff" opacity="0.05" />);
  for (let k = 0; k <= lanes; k++) {
    out.push(<line key={`l${k}`} x1={L + k * laneW} x2={L + k * laneW} y1={top - 40} y2={bottom + 80} stroke="#fff" strokeOpacity={v === 2 ? 0.9 : 0.85} strokeWidth={k === 0 || k === lanes ? 3 : 2} />);
  }
  // distance marks across the lanes
  for (let y = top + 80 + (idx % 2) * 60, i = 0; y < bottom; y += 330, i++) {
    out.push(<rect key={`m${i}`} x={L} y={y} width={R - L} height="5" fill="#fff" opacity="0.8" />);
    out.push(
      <text key={`t${i}`} x={w / 2} y={y - 8} textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" opacity="0.55" fontFamily="sans-serif">
        {(i + 1 + idx * 3) * 100}
      </text>,
    );
  }
  // trees and floodlights on the grass at both sides
  for (let slot = 0, y = top + 90; y < bottom; slot++, y += 170) {
    const x = slot % 2 === 0 ? 20 + hash(slot + idx, 10) : w - 20 - hash(slot + idx, 10);
    out.push(<Tree key={`tr${slot}`} x={x} y={y} s={0.7 + hash(slot, 3) / 10} a={grassTree[0]} b={grassTree[1]} />);
  }
  if (v > 0) {
    for (let slot = 0, y = top + 150; y < bottom; slot++, y += 300) {
      out.push(<Lamp key={`la${slot}`} x={slot % 2 === 0 ? 24 : w - 24} y={y} color={v === 2 ? "#fff6c2" : "#ffd28a"} delay={slot * 0.8} />);
      if (v === 2) out.push(<circle key={`lg${slot}`} cx={slot % 2 === 0 ? L + laneW : R - laneW} cy={y} r="110" fill="#fff6c2" opacity="0.07" />);
    }
  }
  return out;
}

function pool(top: number, bottom: number, w: number, v: Variant, idx: number): ReactNode[] {
  const out: ReactNode[] = [];
  const deck = pick(["#eaf6fa", "#f4d9bd", "#26406a"], v);
  const grid = pick(["#b9d8e4", "#d9b48f", "#35558a"], v);
  const edge = 32;
  const lanes = 6;
  const laneW = (w - 2 * edge) / lanes;

  // water shimmer
  for (let i = 0, y = top + 40; y < bottom; i++, y += 70) {
    const x0 = hash(i * 5 + idx, 60);
    out.push(
      <path
        key={`sh${i}`}
        d={`M ${edge + x0} ${y} q 14 -8 28 0 t 28 0 t 28 0 t 28 0`}
        stroke="#fff"
        strokeOpacity={v === 2 ? 0.14 : 0.3}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="ff-pulse-soft"
        style={{ animationDelay: `${-(i % 5) * 0.4}s` }}
      />,
    );
  }
  // lane ropes: a thin cord with red and white floats
  for (let k = 1; k < lanes; k++) {
    const x = edge + k * laneW;
    out.push(<line key={`rope${k}`} x1={x} x2={x} y1={top - 40} y2={bottom + 80} stroke="#0a3d5f" strokeOpacity="0.55" strokeWidth="2" />);
    out.push(<line key={`fr${k}`} x1={x} x2={x} y1={top - 40} y2={bottom + 80} stroke="#ff4d4d" strokeWidth="7" strokeLinecap="round" strokeDasharray="7 17" />);
    out.push(<line key={`fw${k}`} x1={x} x2={x} y1={top - 40 + 12} y2={bottom + 80} stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray="7 17" />);
  }
  // black lane-centre lines on the bottom of the pool
  for (let k = 0; k < lanes; k++) {
    const x = edge + k * laneW + laneW / 2;
    out.push(<line key={`c${k}`} x1={x} x2={x} y1={top - 40} y2={bottom + 80} stroke="#0a3d5f" strokeOpacity="0.35" strokeWidth="4" />);
  }
  // decks with tile joints on both sides
  for (const [key, x0] of [["dl", 0], ["dr", w - edge]] as [string, number][]) {
    out.push(<rect key={key} x={x0} y={top - 40} width={edge} height={bottom - top + 120} fill={deck} />);
    for (let y = top; y < bottom + 40; y += 22) out.push(<line key={`${key}${y}`} x1={x0} x2={x0 + edge} y1={y} y2={y} stroke={grid} strokeWidth="1.2" />);
    out.push(<line key={`${key}e`} x1={x0 === 0 ? edge : w - edge} x2={x0 === 0 ? edge : w - edge} y1={top - 40} y2={bottom + 80} stroke="#fff" strokeWidth="4" />);
  }
  // starting blocks at the start of the zone, on the left deck
  for (let k = 0; k < 3; k++) out.push(<rect key={`sb${k}`} x="4" y={top + 130 + k * 30} width="24" height="18" rx="3" fill="#9aa8b4" opacity="0.9" />);
  for (let i = 0, y = top + 60; y < bottom; i++, y += 55) out.push(<Float key={`f${i}`} x={edge + 14 + hash(i * 3 + idx, w - 2 * edge - 28)} y={y + 30} delay={i * 0.7} />);
  if (v === 2) {
    for (let slot = 0, y = top + 140; y < bottom; slot++, y += 230) {
      out.push(<ellipse key={`ug${slot}`} cx={w / 2 + (slot % 2 === 0 ? -60 : 60)} cy={y} rx="70" ry="42" fill="#46e6f0" opacity="0.16" className="ff-halo" style={{ transformOrigin: `${w / 2}px ${y}px`, animationDelay: `${-slot * 0.9}s` }} />);
    }
  }
  return out;
}

function gym(top: number, bottom: number, w: number, v: Variant, idx: number): ReactNode[] {
  const out: ReactNode[] = [];
  const plank = pick(["#8a6a3a", "#3b3d46", "#2a2f3c"], v);
  const plate = pick(["#ff5637", "#ff9d1c", "#46e6c4"], v);
  const mat = pick(["#4a6cf7", "#a8452a", "#1d6a8a"], v);
  const bell = pick(["#2f3342", "#2b2e3a", "#1b1e2a"], v);

  // floor: wood planks / concrete slabs / dark rubber with neon
  for (let y = top; y < bottom + 40; y += 24) out.push(<line key={`p${y}`} x1="0" x2={w} y1={y} y2={y} stroke={plank} strokeOpacity="0.28" strokeWidth="1.5" />);
  if (v === 1) for (let x = 40; x < w; x += 80) out.push(<line key={`c${x}`} x1={x} x2={x} y1={top} y2={bottom + 40} stroke="#000" strokeOpacity="0.14" strokeWidth="1.5" />);
  // training zones painted on the floor
  for (let i = 0, y = top + 200; y < bottom; i++, y += 380) {
    out.push(<rect key={`z${i}`} x="64" y={y} width={w - 128} height="120" rx="14" fill="none" stroke={v === 2 ? "#46e6c4" : "#fff"} strokeOpacity={v === 2 ? 0.55 : 0.4} strokeWidth="3" strokeDasharray="14 10" />);
  }
  // equipment along both sides, top-down
  for (let slot = 0, y = top + 130; y < bottom - 20; slot++, y += 180) {
    const left = slot % 2 === 0;
    const x = left ? 38 + hash(slot + idx, 22) : w - 38 - hash(slot * 3 + idx, 22);
    switch ((slot + idx) % 7) {
      case 0:
        out.push(<Barbell key={`e${slot}`} x={x} y={y} s={0.9} rot={90} color={plate} />);
        break;
      case 1:
        out.push(<Rack key={`e${slot}`} x={x} y={y} s={0.8} />);
        break;
      case 2:
        out.push(<Dumbbell key={`e${slot}`} x={x} y={y} s={1.1} rot={hash(slot, 40) - 20} color={plate} />, <Dumbbell key={`e2${slot}`} x={x + 6} y={y + 26} s={1.1} rot={hash(slot, 40) - 20} color={plate} />);
        break;
      case 3:
        out.push(<Treadmill key={`e${slot}`} x={x} y={y} s={0.9} color={plate} />);
        break;
      case 4:
        out.push(<Kettlebell key={`e${slot}`} x={x} y={y} color={bell} />, <Kettlebell key={`e2${slot}`} x={x + (left ? 30 : -30)} y={y + 10} s={0.8} color={bell} />);
        break;
      case 5:
        out.push(<Mat key={`e${slot}`} x={x} y={y} s={0.85} color={mat} />);
        break;
      default:
        out.push(<PlateStack key={`e${slot}`} x={x} y={y} color={plate} />);
    }
  }
  if (v === 2) {
    for (const x of [14, w - 14]) out.push(<line key={`n${x}`} x1={x} x2={x} y1={top - 20} y2={bottom + 60} stroke="#46e6c4" strokeWidth="4" strokeLinecap="round" opacity="0.8" className="ff-pulse-soft" />);
    for (let slot = 0, y = top + 160; y < bottom; slot++, y += 260) out.push(<Lamp key={`sp${slot}`} x={slot % 2 === 0 ? w * 0.3 : w * 0.7} y={y} color="#7bd0ff" delay={slot} />);
  } else if (v === 1) {
    for (let slot = 0, y = top + 160; y < bottom; slot++, y += 320) out.push(<Lamp key={`sp${slot}`} x={slot % 2 === 0 ? w * 0.25 : w * 0.75} y={y} color="#ffb066" delay={slot} />);
  }
  return out;
}

function park(top: number, bottom: number, w: number, v: Variant, idx: number): ReactNode[] {
  const out: ReactNode[] = [];
  const stripe = v === 2 ? "#000" : "#fff";
  const canopy = pick([["#2e8b3c", "#6fd47a"], ["#6d8a2a", "#b3c64e"], ["#0f3a28", "#1f6a48"]], v);
  const metal = pick(["#2b6fe0", "#d9552b", "#46e6c4"], v);

  // mown stripes
  for (let y = top, i = 0; y < bottom + 40; y += 46, i++) {
    if (i % 2 === 0) out.push(<rect key={`s${i}`} x="0" y={y} width={w} height="46" fill={stripe} opacity={v === 2 ? 0.1 : 0.06} />);
  }
  // gravel patches
  for (let i = 0, y = top + 120; y < bottom; i++, y += 210) {
    out.push(<ellipse key={`g${i}`} cx={i % 2 === 0 ? 60 : w - 60} cy={y} rx="46" ry="30" fill={pick(["#d9c9a3", "#c9a77a", "#3a3f44"], v)} opacity="0.7" />);
  }
  for (let slot = 0, y = top + 130; y < bottom - 20; slot++, y += 176) {
    const left = slot % 2 === 0;
    const x = left ? 40 + hash(slot + idx, 24) : w - 40 - hash(slot * 5 + idx, 24);
    switch ((slot + idx) % 6) {
      case 0:
        out.push(<PullUpBar key={`e${slot}`} x={x} y={y} s={1.05} color={metal} />);
        break;
      case 1:
        out.push(<Tree key={`e${slot}`} x={x} y={y} s={1.15} a={canopy[0]} b={canopy[1]} />);
        break;
      case 2:
        out.push(<ParallelBars key={`e${slot}`} x={x} y={y} s={0.95} color={metal} />);
        break;
      case 3:
        out.push(<SandPit key={`e${slot}`} x={x} y={y} />);
        break;
      case 4:
        out.push(<Tree key={`e${slot}`} x={x} y={y} s={0.85} a={canopy[0]} b={canopy[1]} />, <Bench key={`b${slot}`} x={x + (left ? 40 : -40)} y={y + 20} rot={hash(slot, 20) - 10} />);
        break;
      default:
        out.push(<Tires key={`e${slot}`} x={x} y={y} s={1.1} />);
    }
  }
  if (v > 0) {
    for (let slot = 0, y = top + 190; y < bottom; slot++, y += 280) out.push(<Lamp key={`la${slot}`} x={slot % 2 === 0 ? w - 22 : 22} y={y} color={v === 2 ? "#ffe9a8" : "#ffc27a"} delay={slot} />);
  }
  return out;
}

const SCENES = { track, pool, gym, park } as const;

/** Per-variant wash over the finished scene: warm for sunset, dark with stars for night. */
function VariantWash({ v, top, bottom, width, d }: { v: Variant; top: number; bottom: number; width: number; d: string }) {
  if (v === 0) return null;
  const stars =
    v === 2
      ? Array.from({ length: Math.floor((bottom - top) / 26) }, (_, i) => (
          <circle key={i} cx={4 + hash(i * 3 + 1, width - 8)} cy={top + 4 + hash(i * 7 + 2, bottom - top - 8)} r={0.6 + hash(i, 9) / 10} fill="#fff" className="ff-twinkle" style={{ animationDelay: `${-hash(i, 30) / 10}s` }} />
        ))
      : null;
  return (
    <g>
      <path d={`${d} V ${bottom + 60} H 0 Z`} fill={v === 1 ? "#ff7a1a" : "#04061a"} opacity={v === 1 ? 0.16 : 0.42} />
      {stars}
    </g>
  );
}

/** The painted background of one level: base gradient, a wavy top edge over the zone above, the venue scene and the time-of-day wash. */
export function ZoneBackground({
  index,
  top,
  bottom,
  width,
  theme,
  gradientId,
  clipId,
}: {
  index: number;
  top: number;
  bottom: number;
  width: number;
  theme: Theme;
  gradientId: string;
  clipId: string;
}) {
  const waveTop = index === 0 ? top : top - 12;
  const wave =
    index === 0
      ? `M 0 ${top} H ${width}`
      : `M 0 ${waveTop + 12} C ${width * 0.2} ${waveTop - 8}, ${width * 0.4} ${waveTop + 22}, ${width * 0.6} ${waveTop + 8} S ${width * 0.9} ${waveTop - 4}, ${width} ${waveTop + 10}`;
  const shape = `${wave} V ${bottom + 70} H 0 Z`;
  const scene = SCENES[theme.venue](top, bottom, width, theme.variant, index);

  return (
    <g>
      <clipPath id={clipId}>
        <path d={shape} />
      </clipPath>
      <path d={shape} fill={`url(#${gradientId})`} />
      <g clipPath={`url(#${clipId})`}>
        {scene}
        <VariantWash v={theme.variant} top={top} bottom={bottom} width={width} d={wave} />
      </g>
      {index > 0 && <path d={wave} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" />}
    </g>
  );
}
