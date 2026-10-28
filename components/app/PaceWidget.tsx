"use client";

import { Card } from "./primitives";
import PaceForm from "./PaceForm";
import { useSession } from "./Session";

/** Home: asks for the 5 km time while a running plan has no personal paces yet. Disappears once it is saved. */
export default function PaceWidget() {
  const { pace } = useSession();
  if (!pace || !pace.needed) return null;
  return (
    <Card className="ff-rise-in p-5 sm:p-6" aria-label="זמן 5 ק״מ">
      <h2 className="font-heading text-headline-sm font-bold">מה הזמן שלכם ב־5 ק״מ?</h2>
      <p className="mt-1 text-body-md text-text-secondary">
        נחשב לפיו את הקצבים האישיים שלכם לכל אימון ריצה: קל, סף ואינטרוולים. אפשר להזין תוצאה אחרונה, ולשנות אותה בהגדרות.
      </p>
      <div className="mt-4">
        <PaceForm submitLabel="חישוב הקצבים" />
      </div>
      <p className="mt-3 text-label-md text-text-muted">אין עדיין תוצאה? בלי זמן תראו בכל אימון איך הקצב אמור להרגיש, ותוכלו להזין זמן בכל שלב.</p>
    </Card>
  );
}
