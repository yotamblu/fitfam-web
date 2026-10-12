"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, api, describeError, type CurrentUser, type MyPlan, type Stats } from "@/lib/api";
import { isRunning, sfx } from "@/lib/sfx";
import Button from "../ui/Button";
import { BrandLoader } from "./ui";

type SessionValue = {
  user: CurrentUser;
  plans: MyPlan[];
  /** Points, account level and weekly streak; null only while they load or if that call failed. */
  stats: Stats | null;
  reloadStats: () => Promise<Stats | null>;
  /** The plan the roadmap tab shows; the customer's most recent choice, else the first plan. */
  activePlan: MyPlan | null;
  setActiveSlug: (slug: string) => void;
  reloadPlans: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>");
  return value;
}

const ACTIVE_KEY = "fitfam.activePlan";

function readStoredSlug(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

/** Gate for every signed-in screen: loads the user and their plans, or sends the visitor back to the welcome page. */
export default function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [plans, setPlans] = useState<MyPlan[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [attempt, setAttempt] = useState(0);

  // browsers only allow audio from a tap, and iPhones only from a FINISHED tap (touchend / click), so every one of those
  // tries to unlock until the audio engine is really running; coming back to the app tries again (iOS can suspend it)
  useEffect(() => {
    const events = ["touchend", "click", "pointerup", "keydown"] as const;
    const attempt = () => {
      sfx.unlock();
      if (isRunning()) events.forEach((name) => window.removeEventListener(name, attempt, true));
    };
    const rearm = () => {
      if (document.visibilityState !== "visible" || isRunning()) return;
      events.forEach((name) => window.addEventListener(name, attempt, { capture: true, passive: true }));
    };
    events.forEach((name) => window.addEventListener(name, attempt, { capture: true, passive: true }));
    document.addEventListener("visibilitychange", rearm);
    window.addEventListener("ff-audio-state", rearm);
    return () => {
      events.forEach((name) => window.removeEventListener(name, attempt, true));
      document.removeEventListener("visibilitychange", rearm);
      window.removeEventListener("ff-audio-state", rearm);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.me(), api.myPlans(), api.stats().catch(() => null)])
      .then(([me, myPlans, myStats]) => {
        if (cancelled) return;
        setUser(me);
        setPlans(myPlans);
        setStats(myStats);
        setSlug(readStoredSlug());
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          router.replace("/");
          return;
        }
        setError(describeError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  const reloadStats = useCallback(async (): Promise<Stats | null> => {
    try {
      const fresh = await api.stats();
      setStats(fresh);
      return fresh;
    } catch {
      // keep the numbers we already have
      return null;
    }
  }, []);

  const reloadPlans = useCallback(async () => {
    try {
      setPlans(await api.myPlans());
    } catch {
      // keep the plans we already have
    }
  }, []);

  const setActiveSlug = useCallback((next: string) => {
    setSlug(next);
    try {
      window.localStorage.setItem(ACTIVE_KEY, next);
    } catch {
      // a remembered choice is only a convenience
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      router.replace("/");
    }
  }, [router]);

  const value = useMemo<SessionValue | null>(() => {
    if (!user || !plans) return null;
    const activePlan = plans.find((p) => p.planSlug === slug) ?? plans[0] ?? null;
    return { user, plans, stats, reloadStats, activePlan, setActiveSlug, reloadPlans, logout };
  }, [user, plans, stats, reloadStats, slug, setActiveSlug, reloadPlans, logout]);

  if (error) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-gutter text-center">
        <p role="alert" className="text-body-lg text-ember">
          {error}
        </p>
        <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
          ניסיון נוסף
        </Button>
      </main>
    );
  }
  if (!value) return <BrandLoader label="טוענים את האימונים שלכם" />;
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
