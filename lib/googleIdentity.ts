"use client";

import { useEffect, useState } from "react";

export type GoogleIdentity = {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(element: HTMLElement, options: Record<string, unknown>): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

let loading: Promise<GoogleIdentity> | null = null;
let initialized = false;
let currentCallback: ((credential: string) => void) | null = null;

/** Loads Google's sign-in script once and resolves with its identity API. */
function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google) return Promise.resolve(window.google.accounts.id);
  loading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.google
        ? resolve(window.google.accounts.id)
        : reject(new Error("Google script loaded without the identity API"));
    script.onerror = () => {
      loading = null;
      reject(new Error("Could not load the Google sign-in script"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export type GoogleSignInStatus = "loading" | "ready" | "failed";

/**
 * Loads and initialises Google sign-in once. Google hands back an ID token ("credential") only through its own
 * rendered button, so the UI renders that button (see GoogleButtonOverlay) and receives the token here.
 */
export function useGoogleSignIn(onCredential: (credential: string) => void): GoogleSignInStatus {
  const [loaded, setLoaded] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    currentCallback = onCredential;
    return () => {
      if (currentCallback === onCredential) currentCallback = null;
    };
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then((google) => {
        // Google warns if initialize() runs more than once (React runs effects twice in development).
        if (!initialized) {
          initialized = true;
          google.initialize({
            client_id: CLIENT_ID,
            callback: (response) => currentCallback?.(response.credential),
          });
        }
        if (!cancelled) setLoaded("ready");
      })
      .catch(() => {
        if (!cancelled) setLoaded("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return CLIENT_ID ? loaded : "failed";
}
