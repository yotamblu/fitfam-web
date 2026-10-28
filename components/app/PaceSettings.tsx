"use client";

import { useState } from "react";
import { describeError } from "@/lib/api";
import { clockText, paceRange } from "@/lib/pace";
import Button from "../ui/Button";
import PaceForm from "./PaceForm";
import { Card } from "./primitives";
import { useSession } from "./Session";

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
    <Card className="p-4" aria-label="קצבי ריצה">
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
              <li key={p.kind} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-body-md font-semibold">{p.labelHe}</span>
                  <span className="block text-label-md text-text-muted">{p.feelHe}</span>
                </span>
                <span dir="ltr" className="shrink-0 font-heading text-body-lg font-bold tabular-nums">
                  {paceRange(p)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-label-md text-text-muted">דקות לכל ק״מ. אם הטווח מרגיש קשה בהרבה מהתיאור, בחום, ברוח או בעייפות, מאטים.</p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              עדכון הזמן
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => void reset()}>
              איפוס
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
