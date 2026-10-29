import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import TermsText from "@/components/legal/TermsText";
import { TERMS_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "תנאי שימוש | FitFam" };

export default function TermsPage() {
  return (
    <LegalPage title="תנאי שימוש" version={TERMS_VERSION}>
      <TermsText />
    </LegalPage>
  );
}
