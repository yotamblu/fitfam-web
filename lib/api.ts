// Same-origin by default: app/backend/[...path]/route.ts forwards /backend/* to the API.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/backend";

export type CurrentUser = {
  id: string;
  email: string;
  role: "admin" | "customer";
  displayName: string | null;
  avatarUrl: string | null;
};

/** An error response from the API: `{"error": "<code>"}` with an HTTP status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // credentials: "include" sends the HttpOnly session cookie; JavaScript never sees the token.
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    let code = "unknown";
    try {
      const body = (await response.json()) as { error?: string };
      code = body.error ?? code;
    } catch {
      // body was not JSON; keep "unknown"
    }
    throw new ApiError(response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// ---- training (what the API returns for a logged-in customer) ----

export type Sport = "running" | "swimming" | "gym" | "calisthenics";
export type NodeState = "done" | "current" | "locked" | "skipped" | "open";

export type MyPlan = {
  enrollmentId: string;
  planSlug: string;
  planNameHe: string;
  levelNumber: number;
  levelNameHe: string | null;
  status: string;
};

export type RoadmapWorkout = {
  id: string;
  sortOrder: number;
  type: "regular" | "checkpoint" | "challenge";
  sport: Sport;
  titleHe: string | null;
  estMinutes: number | null;
  state: NodeState;
  canAttempt: boolean;
};

export type RoadmapLevel = {
  id: string;
  levelNumber: number;
  nameHe: string | null;
  state: NodeState;
  workouts: RoadmapWorkout[];
};

export type Roadmap = {
  enrollmentId: string;
  planSlug: string;
  planNameHe: string;
  currentLevelNumber: number;
  planCompleted: boolean;
  levels: RoadmapLevel[];
};

export type CustomerWorkout = {
  id: string;
  type: "regular" | "checkpoint" | "challenge";
  sport: Sport;
  titleHe: string | null;
  descriptionHe: string | null;
  goalHe: string | null;
  estMinutes: number | null;
  state: NodeState;
  resumeStep: number;
  levelNumber: number;
  /** the sport most of this level's workouts are tagged with: it decides the venue painted behind the workout */
  levelSport: Sport | null;
};

/** A personal running pace: seconds per km from the fast to the slow end (null until the customer enters a 5 km time). */
export type PaceInfo = {
  kind: "easy" | "threshold" | "interval" | "fivek";
  labelHe: string;
  feelHe: string;
  fastSecPerKm: number | null;
  slowSecPerKm: number | null;
  /** target time of one distance repeat, in seconds (only for repeats measured in metres) */
  repFastSec: number | null;
  repSlowSec: number | null;
};

export type PaceStatus = {
  fiveKSec: number | null;
  updatedAt: string | null;
  /** true when the customer follows a running plan but has not entered a 5 km time */
  needed: boolean;
  paces: PaceInfo[];
};

export type StepTarget = {
  exercise: {
    id: string;
    nameHe: string;
    measure: string;
    youtubeId: string | null;
    descriptionHe: string | null;
    cuesHe: string | null;
  } | null;
  reps: number | null;
  repsMax: number | null;
  durationSec: number | null;
  distanceM: number | null;
  calories: number | null;
  capSec: number | null;
  zone: number | null;
  rpe: number | null;
  loadHe: string | null;
  notesHe: string | null;
  pace: PaceInfo | null;
};

export type Step = {
  index: number;
  type: "work" | "rest" | "timed_block";
  sectionTitle: string | null;
  blockStyle: string;
  blockNotes: string | null;
  setNumber: number | null;
  setCount: number | null;
  roundNumber: number | null;
  roundCount: number | null;
  durationSec: number | null;
  intervalSec: number | null;
  capSec: number | null;
  target: StepTarget | null;
  targets: StepTarget[] | null;
};

export type CustomerExercise = {
  id: string;
  nameHe: string;
  sport: Sport;
  measure: string;
  equipment: string[];
  muscleGroups: string[];
  descriptionHe: string | null;
  cuesHe: string | null;
  youtubeId: string | null;
};

export type StepsResponse = { workoutId: string; resumeStep: number; steps: Step[] };

export type AttemptResult = { passed: boolean; currentLevelNumber: number; levelChanged: boolean; planCompleted: boolean };

export type Stats = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  totalWorkouts: number;
  challengesPassed: number;
  weeklyGoal: number;
  weekCount: number;
  weekDays: boolean[];
  todayIndex: number;
  weeklyStreak: number;
  recentWeeks: number[];
  rewards: { workout: number; challenge: number };
};

export type ConsentStatus = {
  required: boolean;
  ok: boolean;
  termsVersion: string;
  privacyVersion: string;
  healthVersion: string;
  terms: { version: string; acceptedAt: string; current: boolean } | null;
  health: { version: string; declaredAt: string; expiresAt: string; current: boolean } | null;
};

export type HealthInput = {
  version: string;
  conditionsDeclaration: boolean;
  riskAcknowledged: boolean;
  accuracyConfirmed: boolean;
  dataConsent: boolean;
  ageConfirmed: boolean;
  fullName: string;
};

export const api = {
  me: () => request<CurrentUser>("/auth/me"),
  stats: () => request<Stats>("/me/stats"),
  pace: () => request<PaceStatus>("/me/pace"),
  setPace: (fiveKSec: number) => request<PaceStatus>("/me/pace", { method: "PUT", body: JSON.stringify({ fiveKSec }) }),
  clearPace: () => request<PaceStatus>("/me/pace", { method: "DELETE" }),
  myPlans: () => request<MyPlan[]>("/me/plans"),
  roadmap: (slug: string) => request<Roadmap>(`/me/plans/${encodeURIComponent(slug)}/roadmap`),
  workout: (id: string) => request<CustomerWorkout>(`/workouts/${id}`),
  steps: (id: string) => request<StepsResponse>(`/workouts/${id}/steps`),
  exercise: (id: string) => request<CustomerExercise>(`/exercises/${id}`),
  saveProgress: (id: string, resumeStep: number) =>
    request<void>(`/workouts/${id}/progress`, { method: "PUT", body: JSON.stringify({ resumeStep }) }),
  complete: (id: string) => request<Roadmap>(`/workouts/${id}/complete`, { method: "POST" }),
  attemptChallenge: (id: string, passed: boolean) =>
    request<AttemptResult>(`/challenges/${id}/attempt`, { method: "POST", body: JSON.stringify({ passed }) }),
  loginWithGoogle: (credential: string) =>
    request<CurrentUser>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  consents: () => request<ConsentStatus>("/me/consents"),
  acceptTerms: (termsVersion: string, privacyVersion: string) =>
    request<ConsentStatus>("/me/consents/terms", { method: "POST", body: JSON.stringify({ termsVersion, privacyVersion, ageConfirmed: true }) }),
  declareHealth: (input: HealthInput) =>
    request<ConsentStatus>("/me/consents/health", { method: "POST", body: JSON.stringify(input) }),
  exportData: () => request<Record<string, unknown>>("/me/export"),
  deleteAccount: () => request<void>("/me", { method: "DELETE" }),
};

const MESSAGES: Record<string, string> = {
  not_invited: "המייל הזה עדיין לא רשום אצלנו. אם אתם חושבים שזו טעות, פנו אלינו.",
  invalid_token: "ההתחברות עם Google נכשלה. נסו שוב.",
  email_not_verified: "כתובת המייל בחשבון ה-Google לא מאומתת.",
  google_unavailable: "אי אפשר להגיע ל-Google כרגע. נסו שוב עוד רגע.",
  api_unreachable: "השרת לא זמין כרגע. נסו שוב עוד רגע.",
  api_not_configured: "השרת לא מוגדר. פנו אלינו.",
  forbidden_origin: "הבקשה נחסמה. רעננו את הדף ונסו שוב.",
  workout_locked: "האימון הזה עוד נעול. מסיימים לפי הסדר.",
  challenge_not_available: "האתגר הזה עדיין לא זמין.",
  not_found: "לא מצאנו את מה שחיפשתם.",
  version_outdated: "הנוסח התעדכן. רעננו את הדף ונסו שוב.",
  age_required: "השירות מיועד לבני 13 ומעלה.",
  confirmations_required: "יש לאשר את כל ההצהרות.",
  name_required: "יש להקליד שם מלא.",
  consent_required: "לפני שמתאמנים צריך לאשר את התנאים ולמלא הצהרת בריאות.",
  admin_cannot_self_delete: "אי אפשר למחוק כך חשבון של מנהל.",
  invalid_five_k: "זמן ה־5 ק״מ צריך להיות בין 12:00 ל־70:00.",
};

/** A Hebrew, user-facing message for an error thrown while logging in. */
export function describeAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? "משהו השתבש. נסו שוב.";
  }
  return "אי אפשר להגיע לשרת כרגע. נסו שוב עוד רגע.";
}

/** A Hebrew, user-facing message for any error thrown while loading or saving training data. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? "משהו השתבש. נסו שוב.";
  }
  return "אי אפשר להגיע לשרת כרגע. נסו שוב עוד רגע.";
}
