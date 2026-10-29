// Versions of the legal texts and the health-declaration questions.
// When a text changes in a way customers must accept again, bump its version here AND in the API
// (fitfam-api LegalVersions.java); the API asks every customer to accept again.
export const TERMS_VERSION = "2026-10-29.2";
export const PRIVACY_VERSION = "2026-10-30";
export const HEALTH_VERSION = "2026-10-30";

/**
 * The conditions the health declaration lists (modelled on the common PAR-Q form). The customer reads them and ticks one
 * declaration; no per-condition answer is stored. Changing this list or the declaration wording means bumping HEALTH_VERSION.
 */
export const HEALTH_CONDITIONS: string[] = [
  "בעיית לב, או הוראת רופא שמותר לי לעסוק בפעילות גופנית רק בהמלצתו.",
  "כאב בחזה בזמן פעילות גופנית, או כאב בחזה גם במנוחה בחודש האחרון.",
  "איבוד שיווי משקל בגלל סחרחורת, או איבוד הכרה.",
  "בעיה בעצמות, במפרקים, בגידים או בגב שעלולה להחמיר בעקבות פעילות גופנית, או פציעה או ניתוח בשנה האחרונה.",
  "נטילת תרופות ללחץ דם או למחלת לב.",
  "לחץ דם גבוה, סוכרת, אסתמה, אפילפסיה או מחלה כרונית אחרת שאינן מאוזנות.",
  "הריון, או לידה בששת החודשים האחרונים.",
  "כל סיבה רפואית אחרת שבגללה לא כדאי לי להתאמן.",
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
