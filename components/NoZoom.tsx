"use client";

import { useEffect } from "react";

/**
 * Safari ignores `user-scalable=no`, so a pinch is also cancelled here (the proprietary gesture events). Double-tap
 * zoom is switched off in the CSS (`touch-action` on html/body), which does not delay or swallow quick taps.
 */
export default function NoZoom() {
  useEffect(() => {
    const stop = (event: Event) => event.preventDefault();
    const names = ["gesturestart", "gesturechange", "gestureend"];
    names.forEach((name) => document.addEventListener(name, stop, { passive: false }));
    return () => names.forEach((name) => document.removeEventListener(name, stop));
  }, []);
  return null;
}
