import { notFound } from "next/navigation";
import ConsentPreview from "@/components/app/ConsentPreview";
import type { ConsentStatus } from "@/lib/api";
import { HEALTH_VERSION, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";

// A development-only page to look at the terms and health-declaration steps without signing in (saving needs a session).
export default async function ConsentPreviewPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { step } = await searchParams;
  const status: ConsentStatus = {
    required: true,
    ok: false,
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
    healthVersion: HEALTH_VERSION,
    questionIds: [],
    terms: step === "health" ? { version: "x", acceptedAt: "", current: true } : null,
    health: null,
  };
  return <ConsentPreview status={status} onlyHealth={step === "health"} />;
}
