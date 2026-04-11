import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const existing = request.cookies.get("visitor_id")?.value;

  if (existing) {
    return NextResponse.next();
  }

  // Generate a new visitor ID for first-time visitors
  const visitorId = crypto.randomUUID();

  // Set header so server components can read it in the same request cycle
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-visitor-id", visitorId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set cookie so the browser stores it for all future requests
  response.cookies.set("visitor_id", visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    // Match page routes only — exclude static assets and internal API calls
    // (SSR fetch to /api/proxy already carries x-visitor-id explicitly)
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
