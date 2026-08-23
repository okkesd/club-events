// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProcessor } from "../processors";
import { revalidateTag } from "next/cache";

const PYTHON_API = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const API_SECRET = process.env.API_SECRET_KEY;

// --- HELPERS ---
// The backend rate-limits on the real client address, which it reads out of the
// forwarded chain. Pass the chain through verbatim rather than collapsing it to
// one entry: the backend picks the rightmost non-trusted hop, and a single-entry
// chain would hand it a client-controlled value instead.
//
// Returns null when the caller sent nothing — an absent header makes the backend
// fall back to the peer address, whereas a fabricated one silently becomes a
// rate-limit bucket of its own.
function getForwardedChain(request: NextRequest): string | null {
  const chain = request.headers.get("x-forwarded-for")?.trim();
  if (chain) return chain;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return null;
}

// Resolves the visitor UUID: explicit header (from SSR) > cookie (from browser)
function getVisitorId(request: NextRequest): string {
  return (
    request.headers.get("x-visitor-id") ||
    request.cookies.get("visitor_id")?.value ||
    "unknown"
  );
}

function getForwardedHeaders(request: NextRequest) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_SECRET || "",
    "X-Visitor-Id": getVisitorId(request),
  };

  const forwardedFor = getForwardedChain(request);
  if (forwardedFor) {
    headers["X-Forwarded-For"] = forwardedFor;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  return headers;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // 1. Get the path parameters (e.g., ["events", "weekly"])
  // Join them to make: "events/weekly"
  const { path } = await params;

  // Now you can safely use .join()
  const pathString = path.join("/");
  //console.log(params)
  //const pathString = params.path.join("/");

  const section = path[0]; // "events", "clubs", "admin", "all_clubs"

  // --- 1. SMART CACHING STRATEGY ---
  let revalidateTime = 60; // Default: Cache for 60 seconds
  let tags: string[] = [];

  // Rule A: Admin routes = NO CACHE
  if (section === "admin") {
    revalidateTime = 0;
  }
  // Rule B: Event routes = Tag "events"
  // Covers: /events/weekly, /events/{id}
  else if (section === "events") {
    tags = ["events"];
    if (path.length === 2 && path[1]) {
      revalidateTime = 0; // Don't cache single event fetches
    }
  }
  // Rule C: Club routes = Tag "clubs"
  // Covers: /clubs/{id}, /all_clubs, /clubs
  else if (section === "clubs" || section === "all_clubs") {
    tags = ["clubs"];
    
    // Special Case: /clubs/{id}/events -> This is actually event data!
    if (path.includes("events")) {
      tags = ["events"]; 
    }
  }
  // Rule D: Announcement routes = Tag "announcements"
  else if (section === "announcements") {
    tags = ["announcements"];
    if (path.length === 2 && path[1]) {
      revalidateTime = 0; // Don't cache single announcement fetches
    }
  }
  // Rule E: Subscription routes = No cache
  else if (section === "subscriptions") {
    revalidateTime = 0;
  }

  // Specific check: User profile should never be cached
  if (pathString === "users/me") {
    revalidateTime = 0;
  }
  
  // 2. Get Query Params (e.g., ?date=2026-02-04)
  const queryString = request.nextUrl.search; // includes the '?'

  // 3. Construct the Python URL
  // Result: http://127.0.0.1:8000/events/weekly?date=2026-02-04
  const targetUrl = `${PYTHON_API}/${pathString}${queryString}`;

  console.log(`🔀 Proxying to: ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: getForwardedHeaders(request),
      // Optional: You can add simple logic to cache only "GET" requests
      next: { 
        revalidate: revalidateTime, 
        tags: tags 
      }
    });

    const data = await res.json();
    
    // Pass along the status code from Python (e.g., 404, 200, 500)
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}



/**
 * Shared Core Logic for all Mutation Requests (POST, PUT, PATCH, DELETE)
 */
async function handleMutation(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  const { path } = await params;
  const pathString = path.join("/"); // e.g., "announcements" or "events/123"
  const targetUrl = `${PYTHON_API}/${path.join("/")}`;

  console.log(`🔀 ${method} Proxy to: ${targetUrl}`);

  try {
    
    // 2. Prepare headers
    const headers: Record<string, string> = {
      "x-api-key": API_SECRET || "",
      "X-Visitor-Id": getVisitorId(request),
    };

    const forwardedFor = getForwardedChain(request);
    if (forwardedFor) {
      headers["X-Forwarded-For"] = forwardedFor;
    }

    // Forward Authorization Header (Crucial for protected actions)
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Forward Content-Type — but skip for multipart so fetch sets it with the boundary
    const contentType = request.headers.get("content-type");
    const isMultipart = contentType?.includes("multipart/form-data");
    if (contentType && !isMultipart) {
      headers["Content-Type"] = contentType;
    }

    // Use arrayBuffer for binary uploads (multipart), text for everything else
    let body: BodyInit | undefined;
    if (isMultipart) {
      body = await request.arrayBuffer();
    } else {
      const rawBody = await request.text();
      body = rawBody || undefined;
    }

    const res = await fetch(targetUrl, {
      method: method,
      headers: isMultipart
        ? { ...headers, "Content-Type": contentType! }
        : headers,
      body,
    });

    if (res.ok) {
      if (pathString.startsWith("announcements")) {
        revalidateTag("announcements", {expire: 0});
        console.log("Cache cleared for tag: announcements");
      }
      // Approving a scraped event publishes a real Event -> bust the events cache
      else if (pathString.startsWith("admin/scraped-events") && pathString.endsWith("/approve")) {
        revalidateTag("events", {expire: 0});
        console.log("Cache cleared for tag: events");
      }
      // You can easily add more rules here later!
      // else if (pathString.startsWith("events")) {
      //   revalidateTag("events");
      // }
    }

    // 4. Handle Response
    let data;
    const resContentType = res.headers.get("content-type");
    if (resContentType && resContentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }

    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error(`Proxy ${method} Error:`, error);
    return NextResponse.json({ error: `Proxy ${method} failed` }, { status: 500 });
  }
}

// Map the mutation methods to our shared handler
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleMutation(req, ctx.params, "POST");
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleMutation(req, ctx.params, "PATCH");
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return handleMutation(req, ctx.params, "PUT");
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  // DELETE usually has no body, but some APIs allow it. 
  // Our processors handle "null" body gracefully via the fallback processor if needed.
  return handleMutation(req, ctx.params, "DELETE");
}