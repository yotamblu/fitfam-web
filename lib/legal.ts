// Versions of the legal texts and the health-declaration questions.
// When a text changes in a way customers must accept again, bump its version here AND in the API
// (fitfam-api LegalVersions.java); the API asks every customer to accept again.
export const TERMS_VERSION = "2026-10-29";
export const PRIVACY_VERSION = "2026-10-29";
export const HEALTH_VERSION = "2026-10-29";

/** Ids must match LegalVersions.HEALTH_QUESTION_IDS in the API. Plain yes/no questions, modelled on the common PAR-Q form. */
export const HEALTH_QUESTIONS: { id: string; text: string }[] = [
  { id: "q1", text: "האם רופא אמר לך אי פעם שיש לך בעיית לב, או שמותר לך לעסוק בפעילות גופנית רק בהמלצת רופא?" },
  { id: "q2", text: "האם את/ה חש/ה כאב בחזה בזמן פעילות גופנית?" },
  { id: "q3", text: "האם בחודש האחרון חשת כאב בחזה גם בזמן מנוחה?" },
  { id: "q4", text: "האם את/ה מאבד/ת שיווי משקל בגלל סחרחורת, או איבדת הכרה אי פעם?" },
  { id: "q5", text: "האם יש לך בעיה בעצמות, במפרקים, בגידים או בגב שעלולה להחמיר בעקבות פעילות גופנית, או שעברת פציעה או ניתוח בשנה האחרונה?" },
  { id: "q6", text: "האם את/ה נוטל/ת כיום תרופות ללחץ דם או למחלת לב?" },
  { id: "q7", text: "האם יש לך לחץ דם גבוה, סוכרת, אסתמה, אפילפסיה או מחלה כרונית אחרת שאינן מאוזנות?" },
  { id: "q8", text: "האם את/ה בהריון, או ילדת בששת החודשים האחרונים?" },
  { id: "q9", text: "האם קיימת סיבה רפואית אחרת שבגללה לא כדאי לך להתאמן?" },
];

const DEFAULT_NAME = "FitFam";
const DEFAULT_EMAIL = "fitfamhybridapp@gmail.com";

/**
 * Who runs the service, for the terms and the privacy policy. For now just the brand and a contact email (both public by
 * design). The real name and business number can be added later with the server-side environment variables
 * LEGAL_OPERATOR_NAME and LEGAL_OPERATOR_ID (and LEGAL_CONTACT_EMAIL, LEGAL_ADDRESS); nothing personal sits in the repository.
 */
export function operatorDetails() {
  return {
    name: process.env.LEGAL_OPERATOR_NAME?.trim() || DEFAULT_NAME,
    taxId: process.env.LEGAL_OPERATOR_ID?.trim() || null,
    email: process.env.LEGAL_CONTACT_EMAIL?.trim() || DEFAULT_EMAIL,
    address: process.env.LEGAL_ADDRESS?.trim() || null,
  };
}

/** "2026-10-29 12:00:00+00" (as the API sends it) -> "29.10.2026". Safari cannot parse the raw form, so it is normalised first. */
export function formatLegalDate(value: string | null | undefined): string {
  if (!value) return "";
  let iso = value.replace(" ", "T");
  if (/[+-]\d\d$/.test(iso)) iso += ":00";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "numeric", year: "numeric" });
}
