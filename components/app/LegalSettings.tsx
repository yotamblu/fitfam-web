"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, describeError } from "@/lib/api";
import { formatLegalDate } from "@/lib/legal";
import Button from "../ui/Button";
import ConsentFlow from "./ConsentFlow";
import { Card } from "./primitives";
import { useSession } from "./Session";

/** Profile: terms and privacy, the health declaration (view / renew), a copy of the customer's data, and account deletion. */
export default function LegalSettings() {
  const router = useRouter();
  const { user, consent, setConsent } = useSession();
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const health = consent?.health ?? null;

  const download = async () => {
    setBusy("export");
    setError(null);
    try {
      const data = await api.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "fitfam-my-data.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("delete");
    setError(null);
    try {
      await api.deleteAccount();
      router.replace("/?signedout=1");
    } catch (e) {
      setError(describeError(e));
      setBusy(null);
    }
  };

  return (
    <>
      <Card className="divide-y divide-white/[0.06]" aria-label="פרטיות ומשפטי">
        <div className="flex flex-col gap-1 p-4">
          <h3 className="font-heading text-body-lg font-bold">הצהרת בריאות</h3>
          {consent && consent.required ? (
            <p className="text-body-md text-text-secondary">
              {health?.current
                ? `בתוקף עד ${formatLegalDate(health.expiresAt)}.`
                : health
                  ? "פג תוקף. יש למלא הצהרה חדשה."
                  : "עוד לא מולאה."}
            </p>
          ) : (
            <p className="text-body-md text-text-secondary">חשבון ניהול אינו חייב בהצהרה.</p>
          )}
          <div className="mt-2">
            <Button variant="secondary" size="sm" onClick={() => setUpdating(true)} disabled={!consent}>
              {health ? "עדכון ההצהרה" : "מילוי ההצהרה"}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 p-4 text-body-md">
          <Link href="/terms" target="_blank" className="text-ember underline">
            תנאי השימוש
          </Link>
          <Link href="/privacy" target="_blank" className="text-ember underline">
            מדיניות הפרטיות
          </Link>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="text-body-md text-text-secondary">אפשר להוריד עותק של כל המידע ששמור עליכם אצלנו.</p>
          <div>
            <Button variant="secondary" size="sm" disabled={busy !== null} onClick={() => void download()}>
              {busy === "export" ? "מכין..." : "הורדת המידע שלי"}
            </Button>
          </div>
        </div>
        {user.role === "customer" && (
          <div className="flex flex-col gap-2 p-4">
            {!confirming ? (
              <>
                <p className="text-body-md text-text-secondary">מחיקת החשבון מוחקת לצמיתות את ההתקדמות, הנקודות וההצהרות שלכם.</p>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                    מחיקת החשבון
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p role="alert" className="text-body-md text-ember">
                  למחוק את החשבון ואת כל המידע? אי אפשר לבטל את זה.
                </p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" disabled={busy !== null} onClick={() => void remove()}>
                    {busy === "delete" ? "מוחק..." : "כן, למחוק"}
                  </Button>
                  <Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => setConfirming(false)}>
                    ביטול
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        {error && (
          <p role="alert" className="p-4 text-body-md text-ember">
            {error}
          </p>
        )}
      </Card>
      {updating && consent && (
        <ConsentFlow
          status={consent}
          onlyHealth
          onClose={() => setUpdating(false)}
          onDone={(next) => {
            setConsent(next);
            setUpdating(false);
          }}
        />
      )}
    </>
  );
}
