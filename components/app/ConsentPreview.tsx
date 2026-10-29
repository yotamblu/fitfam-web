"use client";

import type { ConsentStatus } from "@/lib/api";
import ConsentFlow from "./ConsentFlow";

/** Development-only wrapper: shows a step of the legal flow with a do-nothing "done" handler. */
export default function ConsentPreview({ status, onlyHealth }: { status: ConsentStatus; onlyHealth: boolean }) {
  return <ConsentFlow status={status} onlyHealth={onlyHealth} onDone={() => undefined} />;
}
