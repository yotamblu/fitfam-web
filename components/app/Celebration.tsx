"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Stats } from "@/lib/api";
import { rankTitle, ratio } from "@/lib/gamify";
import { haptic, sfx } from "@/lib/sfx";
import { CheckIcon, FlagIcon, FlameIcon } from "./icons";
import { RowList } from "./primitives";
import { Confetti, Portal } from "./ui";

export type Reward = {
  /** points earned by this workout (0 when nothing was earned) */
  xpGained: number;
  /** the player's numbers just before and just after, for the bar and the streak */
  before: Stats | null;
  after: Stats | null;
  /** the new account level when this workout crossed a level line */
  levelUp: number | null;
};

const VOLT = "#a4d64c";
const GOLD = "#ffd54a";
const EMBER = "#ff5637";

/**
 * The reward moment after a finished workout or a passed level challenge. It plays as a short sequence, each beat with
 * its own sound and light:
 *   1. a burst of colour, a check and the "lesson complete" jingle
 *   2. the points count up with rising ticks and land with a coin
 *   3. the level bar fills (and, when it crosses a line, a full-screen level-up with the fanfare, rays and confetti)
 *   4. the weekly streak catches fire
 *   5. the buttons appear
 * Colour always carries the news too, so nothing depends on sound being on.
 */
export default function Celebration({
  title,
  subtitle,
  reward,
  challenge = false,
  children,
}: {
  title: string;
  subtitle?: string;
  reward: Reward;
  challenge?: boolean;
  children: ReactNode;
}) {
  const rewardRef = useRef(reward);
  const [stage, setStage] = useState(0);
  const [xp, setXp] = useState(0);
  const [barRatio, setBarRatio] = useState(() => (reward.before ? ratio(reward.before.xpIntoLevel, reward.before.xpForNextLevel) : 0));
  const [barLevel, setBarLevel] = useState(() => reward.before?.level ?? reward.after?.level ?? 1);
  const overlayTimer = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const dismissRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const r = rewardRef.current;
    const pending = timers.current;
    const after = r.after;
    const afterRatio = after ? ratio(after.xpIntoLevel, after.xpForNextLevel) : 0;
    const streakGrew = !!(r.before && after && after.weeklyStreak > r.before.weeklyStreak);

    const toExtras = () => {
      if (overlayTimer.current) window.clearTimeout(overlayTimer.current);
      overlayTimer.current = null;
      if (after) {
        setBarLevel(after.level);
        setBarRatio(afterRatio);
      }
      setStage(4);
      if (streakGrew) sfx.streak();
      pending.push(window.setTimeout(() => setStage(5), streakGrew ? 1100 : 450));
    };
    dismissRef.current = toExtras;

    const toBar = () => {
      setStage(2);
      sfx.fill(0.8);
      setBarRatio(r.levelUp !== null ? 1 : afterRatio);
      if (r.levelUp !== null) {
        pending.push(
          window.setTimeout(() => {
            setStage(3);
            sfx.levelUp();
            haptic([60, 50, 140]);
            overlayTimer.current = window.setTimeout(toExtras, 4200);
          }, 1100),
        );
      } else {
        pending.push(window.setTimeout(toExtras, 1000));
      }
    };

    // beat 1
    if (challenge) sfx.challengePass();
    else sfx.workoutComplete();
    haptic(40);

    // beat 2: count the points up
    pending.push(
      window.setTimeout(() => {
        setStage(1);
        if (r.xpGained <= 0) {
          toBar();
          return;
        }
        const duration = Math.min(1700, 700 + r.xpGained * 2.6);
        const start = performance.now();
        let last = 0;
        let ticks = 0;
        const interval = window.setInterval(() => {
          const p = Math.min(1, (performance.now() - start) / duration);
          const value = Math.round(r.xpGained * (1 - Math.pow(1 - p, 3)));
          if (value !== last) {
            last = value;
            setXp(value);
            sfx.pointTick(ticks++);
          }
          if (p >= 1) {
            window.clearInterval(interval);
            sfx.coin();
            pending.push(window.setTimeout(toBar, 500));
          }
        }, 45);
        pending.push(interval);
      }, 950),
    );

    return () => {
      pending.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
      if (overlayTimer.current) window.clearTimeout(overlayTimer.current);
    };
    // the sequence is started once, from the reward the screen was opened with
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const after = reward.after;
  const glow = challenge || reward.levelUp !== null ? GOLD : VOLT;
  const streak = after?.weeklyStreak ?? 0;
  const streakGrew = !!(reward.before && after && after.weeklyStreak > reward.before.weeklyStreak);

  return (
    <>
      <section className="relative mx-auto flex w-full max-w-md flex-col items-center gap-5 overflow-x-clip pt-8 text-center lg:pt-14">
        {/* the burst of colour behind the badge */}
        <div className="relative flex size-28 items-center justify-center">
          <span aria-hidden="true" className="ff-burst pointer-events-none absolute -inset-24 rounded-full" style={{ background: `radial-gradient(circle, ${glow}cc 0%, transparent 62%)` }} />
          <span aria-hidden="true" className="ff-burst pointer-events-none absolute -inset-24 rounded-full [animation-delay:0.14s]" style={{ background: `radial-gradient(circle, ${EMBER}99 0%, transparent 60%)` }} />
          <span aria-hidden="true" className="ff-breathe pointer-events-none absolute -inset-16 rounded-full" style={{ background: `radial-gradient(circle, ${glow}66 0%, transparent 65%)` }} />
          <span className="ff-pop-in relative flex size-24 items-center justify-center rounded-full text-canvas" style={{ backgroundColor: glow }}>
            {challenge ? <FlagIcon className="size-11" /> : <CheckIcon className="size-12" />}
          </span>
        </div>

        <div className="ff-rise-in [animation-delay:200ms]">
          <h2 className="font-heading text-[30px] font-bold leading-10">{title}</h2>
          {subtitle && <p className="mt-1 text-body-lg text-text-secondary">{subtitle}</p>}
        </div>

        {/* points: count up and glow */}
        {reward.xpGained > 0 && stage >= 1 && (
          <div className="ff-glow-in relative flex flex-col items-center">
            <span aria-hidden="true" className="ff-breathe absolute inset-x-6 top-2 h-12 rounded-full blur-2xl" style={{ backgroundColor: VOLT }} />
            <p dir="ltr" className="relative font-heading text-[72px] font-bold leading-none tabular-nums" style={{ color: VOLT }}>
              +{xp}
            </p>
            <p className="relative mt-1 text-body-md text-text-secondary">נקודות</p>
          </div>
        )}

        {/* the level bar */}
        {after && stage >= 2 && (
          <div className="ff-rise-in flex w-full flex-col gap-2 rounded-2xl bg-surface-raised p-4 text-start">
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-body-lg font-bold">
                רמה <span key={barLevel} className="ff-pop-in inline-block tabular-nums">{barLevel}</span> · {rankTitle(barLevel)}
              </p>
              <p dir="ltr" className="text-label-md tabular-nums text-text-secondary">
                {after.xpIntoLevel}/{after.xpForNextLevel}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="התקדמות לרמה הבאה" aria-valuenow={Math.round(barRatio * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full w-full origin-right rounded-full transition-transform duration-[800ms] ease-out" style={{ transform: `scaleX(${barRatio})`, backgroundColor: reward.levelUp !== null && barRatio >= 1 ? GOLD : EMBER }} />
            </div>
          </div>
        )}

        {/* the streak catches fire */}
        {stage >= 4 && streak > 0 && (
          <RowList className="w-full text-start">
            <li className="ff-rise-in flex items-center gap-3 px-4 py-3.5">
              <span className="relative flex size-10 shrink-0 items-center justify-center">
                {streakGrew && <span aria-hidden="true" className="ff-burst absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${EMBER}cc 0%, transparent 65%)` }} />}
                <FlameIcon filled className={`relative size-7 text-ember ${streakGrew ? "ff-flame" : ""}`} />
              </span>
              <div>
                <p className="font-heading text-body-lg font-bold">{streak} שבועות ברצף</p>
                <p className="text-label-md text-text-secondary">{streakGrew ? "הרצף השבועי שלכם עלה" : "הרצף נשמר"}</p>
              </div>
            </li>
          </RowList>
        )}

        {stage >= 5 && <div className="ff-rise-in flex w-full flex-col items-center gap-3">{children}</div>}
      </section>

      {stage === 3 && reward.levelUp !== null && (
        <Portal>
          <LevelUpOverlay level={reward.levelUp} onDone={() => dismissRef.current()} />
        </Portal>
      )}
    </>
  );
}

/** Full-screen level-up: rays turning behind a gold badge, rings of light, confetti, the new rank. */
function LevelUpOverlay({ level, onDone }: { level: number; onDone: () => void }) {
  return (
    <div className="ff-fade-in fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-canvas/95 px-gutter pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center" role="dialog" aria-modal="true" aria-label="עליתם רמה">
      <div aria-hidden="true" className="ff-spin-slow pointer-events-none absolute left-1/2 top-1/2 size-[150vmax] -translate-x-1/2 -translate-y-1/2" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,213,74,0.2) 0deg 7deg, transparent 7deg 18deg)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 46%, transparent 0%, rgba(19,19,20,0.55) 38%, #131314 72%)" }} />
      <Confetti pieces={72} />

      <div className="relative flex size-56 items-center justify-center">
        <span aria-hidden="true" className="ff-burst pointer-events-none absolute -inset-28 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD}dd 0%, transparent 60%)` }} />
        <span aria-hidden="true" className="ff-burst pointer-events-none absolute -inset-28 rounded-full [animation-delay:0.2s]" style={{ background: `radial-gradient(circle, ${EMBER}aa 0%, transparent 58%)` }} />
        <span aria-hidden="true" className="ff-breathe pointer-events-none absolute -inset-20 rounded-full" style={{ background: `radial-gradient(circle, ${GOLD}77 0%, transparent 66%)` }} />
        <span className="ff-pop-in relative flex size-44 items-center justify-center rounded-full text-canvas ring-8 ring-white/20" style={{ backgroundColor: GOLD }}>
          <span dir="ltr" className="font-heading text-[88px] font-bold leading-none tabular-nums">
            {level}
          </span>
        </span>
      </div>

      <p className="ff-rise-in relative mt-8 text-body-lg font-semibold tracking-wide text-text-secondary [animation-delay:350ms]">עליתם רמה</p>
      <h2 className="ff-rise-in relative mt-1 font-heading text-[40px] font-bold leading-[48px] [animation-delay:450ms]" style={{ color: GOLD }}>
        {rankTitle(level)}
      </h2>

      <button
        type="button"
        onClick={onDone}
        className="ff-fade-in relative mt-10 h-12 rounded-xl bg-white/10 px-8 font-heading text-body-lg font-bold text-text-primary transition-colors [animation-delay:1500ms] hover:bg-white/15"
      >
        המשך
      </button>
    </div>
  );
}
