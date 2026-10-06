"use client";

import { useCallback, useEffect, useState } from "react";
import { api, describeAuthError, type CurrentUser } from "@/lib/api";
import { useGoogleSignIn } from "@/lib/googleIdentity";
import GoogleButtonOverlay from "./GoogleButtonOverlay";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

// Google Sign-In is the only auth method (see ../../CLAUDE.md). Both buttons end in the same Google flow: access is
// invite-only, so "start the journey" and "log in" are the same thing for now. Google only returns an ID token through
// its own button, so each styled button has Google's real button laid invisibly on top (GoogleButtonOverlay); the
// token goes to the API, which checks the email against the invited list and sets the session cookie.
export default function AuthActions() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already logged in (valid session cookie)? Then show that instead of the buttons.
  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        // not logged in, or the API is unreachable: just show the login buttons
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCredential = useCallback(async (credential: string) => {
    setBusy(true);
    setNotice(null);
    try {
      setUser(await api.loginWithGoogle(credential));
    } catch (error) {
      setNotice(describeAuthError(error));
    } finally {
      setBusy(false);
    }
  }, []);

  const googleStatus = useGoogleSignIn(handleCredential);

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  if (user) {
    return (
      <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-5 text-center">
        <p className="font-heading text-headline-sm font-bold">
          שלום{user.displayName ? ` ${user.displayName}` : ""} 👋
        </p>
        <p className="text-body-md text-volt">
          התחברתם בהצלחה. המסע שלכם בדרך, עוד רגע 💪
        </p>
        <button
          type="button"
          onClick={() => void logout()}
          className="h-10 rounded-full border border-border-emphasis px-6 text-body-md text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          התנתקות
        </button>
      </div>
    );
  }

  const message =
    notice ??
    (googleStatus === "failed"
      ? "לא הצלחנו לטעון את ההתחברות של Google. בדקו את החיבור ורעננו."
      : null);

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-5">
      <div className="group relative">
        <div
          aria-hidden="true"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white font-heading text-body-lg font-bold text-[#1f1f1f] transition group-hover:bg-zinc-100 group-active:scale-[0.98]"
        >
          <GoogleIcon />
          כבר במסע? התחברות עם Google
        </div>
        <GoogleButtonOverlay ready={googleStatus === "ready"} text="signin_with" />
      </div>

      <div className="group relative">
        <div
          aria-hidden="true"
          className="flex h-12 w-full items-center justify-center rounded-full bg-ember font-heading text-body-lg font-bold text-canvas shadow-glow-ember transition group-hover:brightness-110 group-active:scale-[0.98]"
        >
          התחילו את המסע
        </div>
        <GoogleButtonOverlay ready={googleStatus === "ready"} text="continue_with" />
      </div>

      {busy && (
        <p role="status" aria-live="polite" className="text-center text-body-md text-text-secondary">
          מתחבר...
        </p>
      )}

      {message && !busy && (
        <p role="alert" className="text-center text-body-md text-ember">
          {message}
        </p>
      )}
    </div>
  );
}
