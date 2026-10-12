"use client";

import { useState } from "react";
import type { Stats } from "@/lib/api";
import Button from "../ui/Button";
import Celebration, { type Reward } from "./Celebration";
import StackShell from "./StackShell";

function stats(xp: number, level: number, into: number, next: number, streak: number): Stats {
  return {
    xp,
    level,
    xpIntoLevel: into,
    xpForNextLevel: next,
    totalWorkouts: 5,
    challengesPassed: 0,
    weeklyGoal: 3,
    weekCount: 2,
    weekDays: [false, true, false, true, false, false, false],
    todayIndex: 3,
    weeklyStreak: streak,
    recentWeeks: [0, 1, 2, 2, 3, 2],
    rewards: { workout: 100, challenge: 300 },
  };
}

const SCENARIOS: Record<string, { label: string; title: string; subtitle?: string; challenge?: boolean; reward: Reward }> = {
  workout: {
    label: "אימון רגיל",
    title: "האימון הושלם",
    reward: { xpGained: 100, before: stats(200, 2, 50, 300, 1), after: stats(300, 2, 150, 300, 2), levelUp: null },
  },
  levelup: {
    label: "אימון + עלייה ברמה",
    title: "האימון הושלם",
    reward: { xpGained: 100, before: stats(400, 2, 250, 300, 2), after: stats(500, 3, 50, 450, 2), levelUp: 3 },
  },
  challenge: {
    label: "אתגר מעבר רמה",
    title: "עברתם רמה",
    subtitle: "עכשיו אתם ברמה 2",
    challenge: true,
    reward: { xpGained: 300, before: stats(100, 1, 100, 150, 1), after: stats(400, 2, 250, 300, 1), levelUp: 2 },
  },
};

export default function CelebrationPreview() {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("workout");
  const [run, setRun] = useState(0);
  const current = SCENARIOS[scenario];
  return (
    <StackShell title="תצוגה מקדימה" backHref="/home" backLabel="לבית">
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(SCENARIOS).map(([key, value]) => (
          <Button
            key={key}
            variant={key === scenario ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setScenario(key);
              setRun((n) => n + 1);
            }}
          >
            {value.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}>
          הפעלה מחדש
        </Button>
      </div>
      <Celebration key={`${scenario}-${run}`} title={current.title} subtitle={current.subtitle} challenge={current.challenge} reward={current.reward}>
        <Button variant="ghost" onClick={() => setRun((n) => n + 1)}>
          עוד פעם
        </Button>
      </Celebration>
    </StackShell>
  );
}
