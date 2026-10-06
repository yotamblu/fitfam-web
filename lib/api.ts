// Same-origin by default: next.config.ts forwards /backend/* to the API (see rewrites there).
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

export const api = {
  me: () => request<CurrentUser>("/auth/me"),
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
};

/** A Hebrew, user-facing message for an error thrown while logging in. */
export function describeAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? "משהו השתבש. נסו שוב.";
  }
  return "אי אפשר להגיע לשרת כרגע. נסו שוב עוד רגע.";
}
