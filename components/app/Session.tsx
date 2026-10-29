"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, api, describeError, type ConsentStatus, type CurrentUser, type MyPlan, type PaceStatus, type Stats } from "@/lib/api";
import { isRunning, sfx } from "@/lib/sfx";
import { releaseSplash } from "@/lib/splash";
import Image from "next/image";
import Button from "../ui/Button";
import ConsentFlow from "./ConsentFlow";

type SessionValue = {
  user: CurrentUser;
  plans: MyPlan[];
  /** Points, account level and weekly streak; null only while they load or if that call failed. */
  stats: Stats | null;
  reloadStats: () => Promise<Stats | null>;
  /** The customer's 5 km time and personal paces; null only while they load. */
  pace: PaceStatus | null;
  savePace: (fiveKSec: number) => Promise<void>;
  clearPace: () => Promise<void>;
  /** Terms and health declaration state; null only while loading or if that call failed (the API still enforces it). */
  consent: ConsentStatus | null;
  setConsent: (status: ConsentStatus) => void;
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
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [plans, setPlans] = useState<MyPlan[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pace, setPace] = useState<PaceStatus | null>(null);
  const [consent, setConsent] = useState<ConsentStatus | null>(null);
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
    // a connection that never answers must not hold the splash forever: after a minute, offer a retry
    // (switched off as soon as the load finishes, either way, so a healthy session never gets this error)
    const giveUp = window.setTimeout(() => {
      if (!cancelled) setError("החיבור איטי מדי. בדקו את האינטרנט ונסו שוב.");
    }, 60000);
    Promise.all([api.me(), api.myPlans(), api.stats().catch(() => null), api.pace().catch(() => null), api.consents().catch(() => null)])
      .then(([me, myPlans, myStats, myPace, myConsent]) => {
        window.clearTimeout(giveUp);
        if (cancelled) return;
        setUser(me);
        setPlans(myPlans);
        setStats(myStats);
        setPace(myPace);
        setConsent(myConsent);
        setSlug(readStoredSlug());
        setError(null);
      })
      .catch((e) => {
        window.clearTimeout(giveUp);
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          // the session is gone: clear the cookie (so the welcome page is not skipped again), then show the welcome page
          void api
            .logout()
            .catch(() => undefined)
            .then(() => router.replace("/?signedout=1"));
          return;
        }
        setError(describeError(e));
      });
    return () => {
      cancelled = true;
      window.clearTimeout(giveUp);
    };
  }, [router, attempt]);

  // The home screen releases the splash itself once its own data is in; every other screen (and the error screen) when the session is ready.
  const ready = Boolean(user && plans);
  // the legal steps take the place of the app until they are done (the API refuses training without them anyway)
  const mustConsent = Boolean(consent && consent.required && !consent.ok);
  useEffect(() => {
    if (error || (ready && (pathname !== "/home" || mustConsent))) releaseSplash();
  }, [error, ready, pathname, mustConsent]);

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

  // errors are thrown to the caller (the form shows them)
  const savePace = useCallback(async (fiveKSec: number) => {
    setPace(await api.setPace(fiveKSec));
  }, []);

  const clearPace = useCallback(async () => {
    setPace(await api.clearPace());
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
    return { user, plans, stats, reloadStats, pace, savePace, clearPace, consent, setConsent, activePlan, setActiveSlug, reloadPlans, logout };
  }, [user, plans, stats, reloadStats, pace, savePace, clearPace, consent, slug, setActiveSlug, reloadPlans, logout]);

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
  // no loading screen: while the session loads, the launch splash (or, after a fresh sign-in, the same logo screen) is all there is
  if (!value) {
    return (
      <div aria-hidden="true" className="fixed inset-0 z-50 flex items-center justify-center bg-canvas">
        <Image src="/logo-transparent.png" alt="" width={640} height={573} priority className="h-auto w-[68vw] max-w-[320px]" />
      </div>
    );
  }
  if (consent && mustConsent) {
    return <ConsentFlow status={consent} onDone={setConsent} onLogout={() => void logout()} />;
  }
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
