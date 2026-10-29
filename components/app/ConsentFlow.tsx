"use client";

import { useState, type ReactNode } from "react";
import { api, describeError, type ConsentStatus } from "@/lib/api";
import { HEALTH_QUESTIONS, HEALTH_VERSION, PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal";
import Button from "../ui/Button";
import { Card } from "./primitives";

const FIELD =
  "h-12 w-full rounded-xl bg-white/[0.07] px-3 font-heading text-body-lg font-bold text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

function Check({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5 text-body-md leading-6">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0 accent-ember" />
      <span>{children}</span>
    </label>
  );
}

function Shell({ title, lead, children, onClose }: { title: string; lead?: string; children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-canvas">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-gutter pb-16 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-status-tint via-status-tint/60 to-transparent" />
        <header className="relative flex flex-col gap-2">
          {onClose && (
            <button type="button" onClick={onClose} className="self-start text-body-md text-text-secondary hover:text-text-primary">
              ← חזרה
            </button>
          )}
          <h1 className="font-heading text-[28px] font-bold leading-9">{title}</h1>
          {lead && <p className="text-body-lg text-text-secondary">{lead}</p>}
        </header>
        <div className="relative flex flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}

function TermsStep({ onDone }: { onDone: (status: ConsentStatus) => void }) {
  const [agree, setAgree] = useState(false);
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await api.acceptTerms(TERMS_VERSION, PRIVACY_VERSION));
    } catch (e) {
      setError(describeError(e));
      setBusy(false);
    }
  };

  return (
    <>
      <Card className="p-4">
        <p className="text-body-md leading-6 text-text-secondary">
          התוכניות כלליות ואינן ייעוץ רפואי. פעילות גופנית כרוכה בסיכון, ואת/ה מתאמן/ת על אחריותך. אנחנו שומרים רק את המידע הדרוש להפעלת השירות, ואפשר למחוק אותו בכל עת.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-body-md">
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-ember underline">
            תנאי השימוש
          </a>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-ember underline">
            מדיניות הפרטיות
          </a>
        </div>
      </Card>
      <div className="flex flex-col">
        <Check checked={agree} onChange={setAgree}>
          קראתי ואני מסכים/ה לתנאי השימוש ולמדיניות הפרטיות.
        </Check>
        <Check checked={adult} onChange={setAdult}>
          אני בן/בת 18 ומעלה.
        </Check>
      </div>
      {error && (
        <p role="alert" className="text-body-md text-ember">
          {error}
        </p>
      )}
      <Button size="lg" fullWidth disabled={!agree || !adult || busy} onClick={() => void submit()}>
        {busy ? "שומר..." : "המשך"}
      </Button>
    </>
  );
}

function HealthStep({ onDone }: { onDone: (status: ConsentStatus) => void }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [clearance, setClearance] = useState(false);
  const [risk, setRisk] = useState(false);
  const [accurate, setAccurate] = useState(false);
  const [data, setData] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = HEALTH_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const anyYes = HEALTH_QUESTIONS.some((q) => answers[q.id] === true);
  const blocked = anyYes && !clearance;
  const ready = answered && !blocked && risk && accurate && data && name.trim().length >= 2;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(
        await api.declareHealth({
          version: HEALTH_VERSION,
          answers,
          medicalClearance: anyYes && clearance,
          riskAcknowledged: risk,
          accuracyConfirmed: accurate,
          dataConsent: data,
          adult: true,
          fullName: name.trim(),
        }),
      );
    } catch (e) {
      setError(describeError(e));
      setBusy(false);
    }
  };

  return (
    <>
      <Card className="divide-y divide-white/[0.06]">
        {HEALTH_QUESTIONS.map((q, i) => (
          <fieldset key={q.id} className="flex flex-col gap-3 p-4">
            <legend className="text-body-md leading-6">
              <span dir="ltr" className="me-2 font-bold tabular-nums text-text-muted">
                {i + 1}
              </span>
              {q.text}
            </legend>
            <div className="flex gap-2" role="radiogroup" aria-label={q.text}>
              {[
                { value: false, label: "לא" },
                { value: true, label: "כן" },
              ].map((option) => {
                const selected = answers[q.id] === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option.value }))}
                    className={`h-11 min-w-20 rounded-xl px-5 font-heading text-body-md font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                      selected ? (option.value ? "bg-ember text-canvas" : "bg-volt text-canvas") : "bg-white/[0.07] text-text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </Card>

      {anyYes && (
        <Card className="flex flex-col gap-2 border-s-4 border-ember p-4">
          <p className="font-heading text-body-lg font-bold text-ember">יש תשובה ״כן״</p>
          <p className="text-body-md leading-6 text-text-secondary">
            לפני שמתחילים להתאמן יש להתייעץ עם רופא ולקבל את אישורו. אם עוד לא עשיתם זאת, אפשר לחזור להצהרה אחרי שתקבלו אישור.
          </p>
          <Check checked={clearance} onChange={setClearance}>
            התייעצתי עם רופא, וקיבלתי את אישורו להתאמן.
          </Check>
        </Card>
      )}

      <div className="flex flex-col">
        <Check checked={risk} onChange={setRisk}>
          אני מבין/ה שפעילות גופנית כרוכה בסיכון לפציעה, ושאני מתאמן/ת על אחריותי, בכפוף לתנאי השימוש.
        </Check>
        <Check checked={accurate} onChange={setAccurate}>
          הפרטים שמסרתי נכונים ומלאים. אעדכן את ההצהרה ואפנה לרופא אם מצבי הבריאותי ישתנה.
        </Check>
        <Check checked={data} onChange={setData}>
          אני נותן/ת הסכמה מפורשת לאיסוף ולשמירת המידע הבריאותי שמסרתי, כמפורט במדיניות הפרטיות.
        </Check>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-label-md text-text-secondary">שם מלא (משמש כחתימה)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" className={FIELD} aria-label="שם מלא" />
      </label>

      {error && (
        <p role="alert" className="text-body-md text-ember">
          {error}
        </p>
      )}
      <Button size="lg" fullWidth disabled={!ready || busy} onClick={() => void submit()}>
        {busy ? "שומר..." : "אישור וחתימה"}
      </Button>
      <p className="text-label-md text-text-muted">ההצהרה תקפה לשנתיים, ואז נבקש אותה שוב. אפשר לעדכן אותה בכל עת בפרופיל.</p>
    </>
  );
}

/**
 * The legal steps in order: terms + privacy, then the health declaration. Shows only what is missing (or only the
 * health step when {@code onlyHealth}, used by "update my declaration"). Renders as a full-screen layer.
 */
export default function ConsentFlow({
  status,
  onlyHealth = false,
  onDone,
  onClose,
  onLogout,
}: {
  status: ConsentStatus;
  onlyHealth?: boolean;
  onDone: (status: ConsentStatus) => void;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  const [current, setCurrent] = useState(status);
  const needTerms = !onlyHealth && !current.terms?.current;
  const update = (next: ConsentStatus) => {
    setCurrent(next);
    if (onlyHealth ? next.health?.current : next.ok || (next.terms?.current && next.health?.current)) onDone(next);
  };

  return needTerms ? (
    <Shell title="לפני שמתחילים" lead="שני אישורים קצרים, ואפשר להתחיל להתאמן." onClose={onClose}>
      <TermsStep onDone={update} />
      {onLogout && (
        <Button variant="ghost" onClick={onLogout}>
          התנתקות
        </Button>
      )}
    </Shell>
  ) : (
    <Shell title="הצהרת בריאות" lead="עונים בכנות על כמה שאלות קצרות. המידע נשמר אצלנו בלבד, כמפורט במדיניות הפרטיות." onClose={onClose}>
      <HealthStep onDone={update} />
      {onLogout && (
        <Button variant="ghost" onClick={onLogout}>
          התנתקות
        </Button>
      )}
    </Shell>
  );
}
