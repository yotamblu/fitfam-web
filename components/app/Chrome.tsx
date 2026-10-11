"use client";

import { createContext, useContext } from "react";

/** Colours of the app bars: the top bar + status strip, the bottom bar, and the active-tab accent. */
export type Tint = { top: string; bottom: string; accent: string };

export const DEFAULT_TINT: Tint = { top: "#3d1f1a", bottom: "#1a1a1d", accent: "#ff5637" };

type ChromeValue = { setOverride: (tint: Tint | null) => void };

export const ChromeContext = createContext<ChromeValue>({ setOverride: () => undefined });

/** A screen (the roadmap) calls this to recolour the bars while it is open; pass null to go back to the plan's colours. */
export function useChromeOverride() {
  return useContext(ChromeContext).setOverride;
}
