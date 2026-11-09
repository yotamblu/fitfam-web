"use client";

import { useState, type FormEvent } from "react";
import { describeError, type PaceInfo } from "@/lib/api";
import { clockText, paceRange, parseClock } from "@/lib/pace";
import Button from "../ui/Button";
import PaceForm from "./PaceForm";
import { Card } from "./primitives";
import { useSession } from "./Session";

const ZONE_FIELD =
  "h-12 w-full rounded-xl bg-white/[0.07] px-3 text-center font-heading text-body-lg font-bold tabular-nums text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

/** One pace row; easy, threshold and interval can be changed to the customer's own range (inputs are 16px so iOS does not zoom). */
function ZoneRow({ pace: p, editable }: { pace: PaceInfo; editable: boolean }) {
  const { savePaceZone, resetPaceZone } = useSession();
  const [editing, setEditing] = useState(false);
  const [fast, setFast] = useState("");
  const [slow, setSlow] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setFast(p.fastSecPerKm === null ? "" : clockText(p.fastSecPerKm));
    setSlow(p.slowSecPerKm === null ? "" : clockText(p.slowSecPerKm));
    setError(null);
    setEditing(true);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setEditing(false);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const a = parseClock(fast);
    const b = parseClock(slow);
    if (a === null || b === null) {
      setError("הזינו קצב בפורמט דקות:שניות, למשל 6:30.");
      return;
    }
    if (a > b) {
      setError("הקצב המהיר צריך להיות קטן או שווה לקצב האיטי.");
      return;
    }
    void run(() => savePaceZone(p.kind, a, b));
  };

  return (
    <li className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-body-md font-semibold">
            {p.labelHe}
            {p.custom && <span className="ms-2 rounded-full bg-ember/15 px-2 py-0.5 text-label-md font-semibold text-ember">מותאם אישית</span>}
          </span>
          <span className="block text-label-md text-text-muted">{p.feelHe}</span>
        </span>
        <span dir="ltr" className="shrink-0 font-heading text-body-lg font-bold tabular-nums">
          {paceRange(p)}
        </span>
      </div>
      {editable && !editing && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={open}>
            שינוי הטווח
          </Button>
          {p.custom && (
            <>
              <span className="text-label-md text-text-muted">
                מחושב: <span dir="ltr">{paceRange({ ...p, fastSecPerKm: p.calcFastSecPerKm, slowSecPerKm: p.calcSlowSecPerKm })}</span>
              </span>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => void run(() => resetPaceZone(p.kind))}>
                חזרה לחישוב
              </Button>
            </>
          )}
        </div>
      )}
      {editing && (
        <form onSubmit={submit} className="mt-2 flex flex-col gap-2" noValidate>
          <div className="flex items-end gap-2" dir="ltr">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-label-md text-text-secondary" dir="rtl">
                מהיר (דק׳/ק״מ)
              </span>
              <input inputMode="numeric" autoComplete="off" maxLength={5} placeholder="6:30" value={fast} onChange={(e) => setFast(e.target.value)} className={ZONE_FIELD} aria-label={`${p.labelHe}, קצב מהיר`} />
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-label-md text-text-secondary" dir="rtl">
                איטי (דק׳/ק״מ)
              </span>
              <input inputMode="numeric" autoComplete="off" maxLength={5} placeholder="6:50" value={slow} onChange={(e) => setSlow(e.target.value)} className={ZONE_FIELD} aria-label={`${p.labelHe}, קצב איטי`} />
            </label>
          </div>
          {error && (
            <p role="alert" className="text-body-md text-ember">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "שומר…" : "שמירה"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              ביטול
            </Button>
          </div>
        </form>
      )}
      {!editing && error && (
        <p role="alert" className="mt-1 text-body-md text-ember">
          {error}
        </p>
      )}
    </li>
  );
}

/** Settings: the 5 km time, the four personal paces computed from it, and a way to change or reset it. */
export default function PaceSettings() {
  const { pace, clearPace } = useSession();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!pace) return null;
  const has = pace.fiveKSec !== null;

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      await clearPace();
      setEditing(false);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card data-tour="pace" className="p-4" aria-label="קצבי ריצה">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-body-lg font-bold">קצבי ריצה</h3>
        {has && !editing && (
          <p className="text-body-md text-text-secondary">
            5 ק״מ ב־
            <span dir="ltr" className="font-bold tabular-nums text-text-primary">
              {clockText(pace.fiveKSec!)}
            </span>
          </p>
        )}
      </div>

      {editing || !has ? (
        <div className="mt-3">
          {!has && <p className="mb-3 text-body-md text-text-secondary">הזינו תוצאה אחרונה ב־5 ק״מ ונחשב את הקצבים לכל אימון ריצה.</p>}
          <PaceForm onSaved={() => setEditing(false)} />
          {has && (
            <Button variant="ghost" fullWidth className="mt-2" onClick={() => setEditing(false)}>
              ביטול
            </Button>
          )}
        </div>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {pace.paces.map((p) => (
              <ZoneRow key={p.kind} pace={p} editable={p.kind !== "fivek"} />
            ))}
          </ul>
          <p className="mt-1 text-label-md text-text-muted">דקות לכל ק״מ. החישוב מבוסס על זמן ה־5 ק״מ. אפשר לשנות את הטווח של קל, סף ואינטרוולים. שינוי הזמן מחזיר את הכול לחישוב. אם הטווח מרגיש קשה בהרבה מהתיאור, בחום, ברוח או בעייפות, מאטים.</p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              עדכון הזמן
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => void reset()}>
              איפוס הזמן
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-body-md text-ember">
              {error}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
