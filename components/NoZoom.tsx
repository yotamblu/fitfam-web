"use client";

import { useEffect } from "react";

/**
 * Safari ignores `user-scalable=no`, so a pinch is also cancelled here (the proprietary gesture events). In desktop
 * browsers a trackpad pinch or Ctrl + mouse wheel arrives as a wheel event with ctrlKey and is cancelled too (the
 * keyboard shortcuts Ctrl +/- cannot be blocked by a page). Double-tap
 * zoom is switched off in the CSS (`touch-action` on html/body), which does not delay or swallow quick taps.
 */
export default function NoZoom() {
  useEffect(() => {
    const stop = (event: Event) => event.preventDefault();
    const names = ["gesturestart", "gesturechange", "gestureend"];
    const stopWheelZoom = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };
    names.forEach((name) => document.addEventListener(name, stop, { passive: false }));
    window.addEventListener("wheel", stopWheelZoom, { passive: false });
    return () => {
      names.forEach((name) => document.removeEventListener(name, stop));
      window.removeEventListener("wheel", stopWheelZoom);
    };
  }, []);
  return null;
}
