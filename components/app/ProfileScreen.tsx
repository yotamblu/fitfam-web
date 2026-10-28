"use client";

import Button from "../ui/Button";
import { LogoutIcon } from "./icons";
import PaceSettings from "./PaceSettings";
import SoundModeToggle from "./SoundModeToggle";
import SoundTest from "./SoundTest";
import SoundToggle from "./SoundToggle";
import { ProgressCard } from "./HomeScreen";
import { Card, Figure, RowList, SectionTitle } from "./primitives";
import { useSession } from "./Session";
import { CountUp, Reveal, Skeleton } from "./ui";

/** Account: who you are, how far you have come, your plans, and logout. (Account deletion needs its API endpoint first.) */
export default function ProfileScreen() {
  const { user, plans, stats, logout } = useSession();
  const name = user.displayName ?? user.email;

  return (
    <>
      <header className="ff-rise-in flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised font-heading text-headline-md font-bold">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
          ) : (
            name.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-headline-md font-bold">{name}</h1>
          <p dir="ltr" className="truncate text-start text-body-md text-text-secondary">
            {user.email}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="flex flex-col gap-6">
          {stats ? (
            <>
              <ProgressCard stats={stats} />
              <Card className="ff-rise-in grid grid-cols-3 divide-x divide-x-reverse divide-white/[0.06] [animation-delay:180ms]" aria-label="הסטטיסטיקות שלי">
                <div className="p-5">
                  <Figure value={<CountUp value={stats.totalWorkouts} />} label="אימונים" />
                </div>
                <div className="p-5">
                  <Figure value={<CountUp value={stats.challengesPassed} />} label="אתגרים" />
                </div>
                <div className="p-5">
                  <Figure value={<CountUp value={stats.xp} />} label="נקודות" tone="text-volt" />
                </div>
              </Card>
            </>
          ) : (
            <>
              <Skeleton className="h-64" />
              <Skeleton className="h-24" />
            </>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <SectionTitle>התוכניות שלי</SectionTitle>
            {plans.length === 0 ? (
              <Card className="p-4 text-body-md text-text-secondary">עדיין אין תוכניות.</Card>
            ) : (
              <RowList>
                {plans.map((plan) => (
                  <li key={plan.planSlug} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="font-heading text-body-lg font-bold">{plan.planNameHe}</span>
                    <span className="text-body-md text-text-secondary">{plan.levelNameHe ?? `רמה ${plan.levelNumber}`}</span>
                  </li>
                ))}
              </RowList>
            )}
          </div>

          <Reveal>
            <div className="flex flex-col gap-3">
              <SectionTitle>איך צוברים נקודות</SectionTitle>
              <Card className="divide-y divide-white/[0.06]">
                <p className="flex items-center justify-between gap-3 p-4 text-body-md">
                  <span className="text-text-secondary">אימון שהושלם</span>
                  <span dir="ltr" className="font-bold tabular-nums text-volt">+{stats?.rewards.workout ?? 100}</span>
                </p>
                <p className="flex items-center justify-between gap-3 p-4 text-body-md">
                  <span className="text-text-secondary">אתגר מעבר רמה</span>
                  <span dir="ltr" className="font-bold tabular-nums text-volt">+{stats?.rewards.challenge ?? 300}</span>
                </p>
                <p className="p-4 text-label-md text-text-muted">רמות שדילגתם עליהן לא מזכות בנקודות. הרצף השבועי נשמר כל עוד יש אימון בשבוע.</p>
              </Card>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3">
            <SectionTitle>הגדרות</SectionTitle>
            <PaceSettings />
            <Card className="divide-y divide-white/[0.06]">
              <div className="flex items-center justify-between gap-3 py-1 ps-4 pe-2">
                <span className="text-body-lg">צלילים</span>
                <SoundToggle />
              </div>
              <SoundModeToggle />
              <SoundTest />
            </Card>
            <p className="text-label-md text-text-muted">אין צליל באייפון? בדקו שמתג ההשתקה שבצד המכשיר לא במצב שקט, ושעוצמת המדיה מורמת.</p>
          </div>

          <div>
            <Button variant="ghost" onClick={() => void logout()}>
              <LogoutIcon className="size-4" />
              התנתקות
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
