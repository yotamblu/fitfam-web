"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { api, describeError } from "@/lib/api";
import { buttonClasses } from "../ui/Button";
import { FitbotMark } from "./FitbotChat";
import { ChatIcon, ClockIcon, InfoIcon, LockIcon } from "./icons";
import { Card, RowList } from "./primitives";
import { useSession } from "./Session";

function Fact({ Icon, title, children }: { Icon: ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 px-4 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-text-secondary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-heading text-body-lg font-bold">{title}</p>
        <p className="mt-0.5 text-body-md text-text-secondary">{children}</p>
      </div>
    </li>
  );
}

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
    <div className="flex w-full flex-col gap-6 lg:max-w-xl">
      <header className="ff-rise-in flex items-center gap-4">
        <FitbotMark size={64} value={1} />
        <div>
          <p className="text-body-md text-text-secondary">לפני הפעם הראשונה</p>
          <h1 className="mt-0.5 font-heading text-headline-md font-bold lg:text-[32px] lg:leading-10">Fitbot</h1>
        </div>
      </header>

      <RowList className="ff-rise-in divide-y [animation-delay:80ms]">
        <Fact Icon={InfoIcon} title="בינה מלאכותית">
          Fitbot יכול לטעות, והוא לא תחליף לרופא, לפיזיותרפיסט או למאמן.
        </Fact>
        <Fact Icon={LockIcon} title="הפרטיות שלכם">
          ההודעות נשלחות לעיבוד אצל Google (Gemini). אל תכתבו פרטים מזהים או מידע רפואי שאין בו צורך.
        </Fact>
        <Fact Icon={ClockIcon} title="כמה זמן נשמר">
          שיחות שלא היו בהן פעילות {fitbot?.retentionDays ?? 100} ימים נמחקות. אפשר למחוק שיחה בכל רגע.
        </Fact>
        <Fact Icon={ChatIcon} title="מגבלה יומית">
          עד <span dir="ltr">{fitbot?.dailyLimit ?? 30}</span> הודעות ביום.
        </Fact>
      </RowList>

      <Card className="ff-rise-in flex flex-col gap-4 p-4 [animation-delay:140ms]">
        <label className="flex cursor-pointer items-start gap-3 text-body-md">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--color-ember)]" />
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
        <button type="button" disabled={!agree || busy} onClick={() => void accept()} className={buttonClasses({ size: "lg", fullWidth: true })}>
          {busy ? "רגע..." : "אישור והתחלה"}
        </button>
      </Card>
    </div>
  );
}
