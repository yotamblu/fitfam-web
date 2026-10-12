import { NextResponse, type NextRequest } from "next/server";

// A visitor who carries a session cookie never gets the welcome page: they are sent to the home screen on the server,
// before anything is drawn, however slow the network is. (The cookie is only checked for presence here; the app itself
// asks the API whether it is still valid. If it is not, the app clears it and comes back with ?signedout=1, which this
// rule leaves alone, so there is no redirect loop.)
export function proxy(request: NextRequest) {
  if (request.cookies.has("ff_session") && !request.nextUrl.searchParams.has("signedout")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
