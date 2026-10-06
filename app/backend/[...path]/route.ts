// Same-origin proxy to the Spring Boot API. The browser only ever talks to this site, so the login cookie is
// first-party (iOS Safari drops cookies from a different host) and the API needs no public URL (not even a tunnel).
//
// Why a route handler and not a `rewrites` entry: a browser adds an `Origin` header to POSTs, the API's CORS rules
// reject any origin they do not list (and a tunnel/phone origin changes), and a rewrite cannot drop that header.
// Here the request is re-sent from the server without it, after checking it came from this very site.

// Server side only. Never exposed to the browser.
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8081";

// Least privilege: only these API areas are reachable through the customer app. Add prefixes as features need them.
const ALLOWED_PREFIXES = ["auth/"];

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "cookie"];

function json(status: number, error: string): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/** A browser request from another site must not ride on the user's cookie through this proxy. */
function isSameSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin GETs carry no Origin header
  try {
    const originHost = new URL(origin).host;
    const hosts = [request.headers.get("host"), request.headers.get("x-forwarded-host")];
    return hosts.includes(originHost);
  } catch {
    return false;
  }
}

async function proxy(request: Request, ctx: RouteContext<"/backend/[...path]">): Promise<Response> {
  const { path } = await ctx.params;

  if (path.some((segment) => segment === "." || segment === "..")) return json(400, "invalid_request");
  const apiPath = path.map(encodeURIComponent).join("/");
  if (!ALLOWED_PREFIXES.some((prefix) => `${apiPath}/`.startsWith(prefix))) return json(404, "not_found");
  if (!isSameSite(request)) return json(403, "forbidden_origin");

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(`${API_ORIGIN}/${apiPath}${new URL(request.url).search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return json(502, "api_unreachable");
  }

  const responseHeaders = new Headers({ "Cache-Control": "no-store" });
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }
  return new Response(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
