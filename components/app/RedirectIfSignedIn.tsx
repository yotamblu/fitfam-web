"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api";

/**
 * On the welcome page: a visitor who already has a session goes straight to the home screen and never sees this page.
 * The launch splash (root layout) keeps covering the screen while this happens, so a signed-in customer still gets the
 * splash first and then lands on the home screen.
 */
export default function RedirectIfSignedIn() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then(() => {
        if (!cancelled) router.replace("/home");
      })
      .catch(() => {
        // no session (or the API is unreachable): show the welcome page as usual
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
