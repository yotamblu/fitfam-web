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
  type: "regular" | "challenge";
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
  type: "regular" | "challenge";
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

export const api = {
  me: () => request<CurrentUser>("/auth/me"),
  stats: () => request<Stats>("/me/stats"),
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
