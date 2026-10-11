"use client";

import Button from "../ui/Button";
import Chip from "../ui/Chip";
import { BoltIcon, CheckIcon, FlagIcon, FlameIcon, LogoutIcon } from "./icons";
import { PlayerCard, StreakCard } from "./HomeScreen";
import { useSession } from "./Session";
import { CountUp, Reveal, Skeleton } from "./ui";

/** Account: level and points, the streak, the customer's plans and logout. (Account deletion needs its API endpoint first.) */
export default function ProfileScreen() {
  const { user, plans, stats, logout } = useSession();
  const name = user.displayName ?? user.email;

  return (
    <>
      <section className="ff-rise-in">
        <p className="text-body-md text-text-secondary">הפרופיל שלי</p>
        <h1 className="font-heading text-headline-md font-extrabold lg:text-display-hero">{user.displayName ?? "הפרופיל שלי"}</h1>
        <p dir="ltr" className="text-start text-body-md text-text-muted">
          {user.email}
        </p>
      </section>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-4">
          {stats ? (
            <>
              <PlayerCard stats={stats} name={name} />
              <section className="grid grid-cols-3 gap-3" aria-label="הסטטיסטיקות שלי">
                <Stat icon={<CheckIcon className="size-5" />} label="אימונים" value={stats.totalWorkouts} tone="volt" delay={0} />
                <Stat icon={<FlagIcon className="size-5" />} label="אתגרים" value={stats.challengesPassed} tone="ember" delay={90} />
                <Stat icon={<BoltIcon className="size-5" />} label="נקודות" value={stats.xp} tone="volt" delay={180} />
              </section>
              <StreakCard stats={stats} />
            </>
          ) : (
            <>
              <Skeleton className="h-36" />
              <Skeleton className="h-24" />
              <Skeleton className="h-44" />
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2" aria-label="התוכניות שלי">
            <h2 className="font-heading text-headline-sm font-bold">התוכניות שלי</h2>
            {plans.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface p-4 text-body-md text-text-secondary">עדיין אין תוכניות.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {plans.map((plan, i) => (
                  <li key={plan.planSlug} className="ff-slide-in flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="font-heading text-body-lg font-bold">{plan.planNameHe}</span>
                    <Chip tone="ember">{plan.levelNameHe ?? `רמה ${plan.levelNumber}`}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Reveal>
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 font-heading text-headline-sm font-bold">
                <FlameIcon className="size-5 text-ember" />
                איך צוברים נקודות
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-body-md text-text-secondary">
                <li>
                  כל אימון שמסיימים: <span className="font-bold text-volt">+{stats?.rewards.workout ?? 100}</span>
                </li>
                <li>
                  כל אתגר מעבר רמה שעוברים: <span className="font-bold text-volt">+{stats?.rewards.challenge ?? 300}</span>
                </li>
                <li>רמות שדילגתם עליהן לא מזכות בנקודות, והרצף השבועי ממשיך כל עוד יש אימון בשבוע.</li>
              </ul>
            </section>
          </Reveal>

          <div>
            <Button variant="secondary" onClick={() => void logout()}>
              <LogoutIcon className="size-4" />
              התנתקות
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value, tone, delay }: { icon: React.ReactNode; label: string; value: number; tone: "volt" | "ember"; delay: number }) {
  return (
    <div className="ff-pop-in flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-2 py-4 text-center" style={{ animationDelay: `${delay}ms` }}>
      <span className={tone === "volt" ? "text-volt" : "text-ember"}>{icon}</span>
      <CountUp value={value} className="font-heading text-headline-md font-extrabold" />
      <span className="text-label-md text-text-secondary">{label}</span>
    </div>
  );
}
