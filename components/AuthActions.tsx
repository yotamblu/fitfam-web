"use client";

import { useState } from "react";

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

// Google Sign-In is the only auth method (see ../../CLAUDE.md). Both actions will
// end in the same Google flow; the API that verifies the ID token does not exist yet.
export default function AuthActions() {
  const [notice, setNotice] = useState<string | null>(null);

  const comingSoon = () =>
    setNotice("ההתחברות תופעל ברגע שהשרת של FitFam יהיה מוכן. עוד רגע 💪");

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-5">
      <button
        type="button"
        onClick={comingSoon}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white font-heading text-body-lg font-bold text-[#1f1f1f] transition hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <GoogleIcon />
        כבר במסע? התחברות עם Google
      </button>

      <button
        type="button"
        onClick={comingSoon}
        className="h-12 w-full rounded-full bg-ember font-heading text-body-lg font-bold text-canvas shadow-glow-ember transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
      >
        התחילו את המסע
      </button>

      {notice && (
        <p role="status" aria-live="polite" className="text-center text-body-md text-volt">
          {notice}
        </p>
      )}
    </div>
  );
}
