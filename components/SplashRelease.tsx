"use client";

import { useEffect } from "react";
import { releaseSplash } from "@/lib/splash";

/** On the welcome page: if the visit started on a signed-in screen (an expired session sent us here), let the held splash go. */
export default function SplashRelease() {
  useEffect(() => {
    releaseSplash();
  }, []);
  return null;
}
