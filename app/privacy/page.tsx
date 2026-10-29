import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyText from "@/components/legal/PrivacyText";
import { PRIVACY_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "מדיניות פרטיות | FitFam" };

export default function PrivacyPage() {
  return (
    <LegalPage title="מדיניות פרטיות" version={PRIVACY_VERSION}>
      <PrivacyText />
    </LegalPage>
  );
}
