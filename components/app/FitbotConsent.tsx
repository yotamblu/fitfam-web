"use client";

import Link from "next/link";
import { useState } from "react";
import { api, describeError } from "@/lib/api";
import Button from "../ui/Button";
import { SparkIcon } from "./icons";
import { Card } from "./primitives";
import { useSession } from "./Session";

/** The one-time notice before the first conversation: what Fitbot is, where the messages go, how long they stay. */
export default function FitbotConsent() {
  const { fitbot, setFitbot } = useSession();
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      const overview = await api.fitbotConsent();
      setFitbot(() => overview);
    } catch (e) {
      setError(describeError(e));
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto flex w-full max-w-xl flex-col gap-4 p-5 lg:my-auto">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-ember/15 text-ember">
          <SparkIcon className="size-6" />
        </span>
        <h1 className="font-heading text-headline-sm font-bold">לפני שמתחילים עם Fitbot</h1>
      </div>

      <ul className="flex list-disc flex-col gap-2 ps-5 text-body-md text-text-secondary marker:text-ember">
        <li>Fitbot הוא בינה מלאכותית. הוא יכול לטעות, והוא לא תחליף לרופא, לפיזיותרפיסט או למאמן.</li>
        <li>ההודעות שלכם נשלחות לעיבוד אצל Google (Gemini) כדי לענות. אל תכתבו פרטים מזהים או מידע רפואי שאין בו צורך.</li>
        <li>
          שיחות נשמרות אצלנו עד {fitbot?.retentionDays ?? 100} ימים בלי פעילות, ואז נמחקות. אפשר למחוק שיחה בכל רגע.
        </li>
        <li>אפשר לשלוח עד {fitbot?.dailyLimit ?? 30} הודעות ביום.</li>
      </ul>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/[0.04] p-3 text-body-md">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--color-ember)]" />
        <span>
          הבנתי, ואני מסכים/ה ששיחותיי עם Fitbot יעובדו על ידי ספק בינה מלאכותית כמתואר{" "}
          <Link href="/privacy" target="_blank" className="text-ember underline">
            במדיניות הפרטיות
          </Link>
          .
        </span>
      </label>

      {error && (
        <p role="alert" className="text-body-md text-ember">
          {error}
        </p>
      )}
      <Button size="lg" fullWidth disabled={!agree || busy} onClick={() => void accept()}>
        {busy ? "רגע..." : "אישור והתחלה"}
      </Button>
    </Card>
  );
}
