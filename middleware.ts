import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ── Lightweight in-memory rate limiter ────────────────────────────────────────
// Sheds crawler/scraper floods BEFORE they reach the (DB-heavy, dynamically
// rendered) pages and pile up Passenger processes on shared hosting. A flooded
// request gets a 429 in microseconds and frees its process immediately, instead
// of holding it for a full render + several Prisma queries.
//
// Fixed-window counter keyed by client IP. The store is per-process memory, so
// under Passenger's multi-process model the effective ceiling scales with the
// number of workers — that's fine: the goal is to stop single-IP bursts, and
// Cloudflare (Bot Fight Mode) handles distributed abuse at the edge.
//
// ~60 requests / 10s is far above how fast Googlebot/Bingbot crawl a single
// site, so legitimate search indexing is never throttled — only abusive bursts.
const WINDOW_MS = 10_000
const MAX_REQUESTS = 60
const hits = new Map<string, { count: number; resetAt: number }>()
let lastSweep = 0

function isRateLimited(ip: string, now: number): boolean {
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_REQUESTS
}

// Drop expired buckets occasionally so the Map can't grow unbounded.
function sweep(now: number) {
  for (const [ip, entry] of hits) {
    if (now > entry.resetAt) hits.delete(ip)
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function middleware(request: NextRequest) {
  const now = Date.now()
  if (now - lastSweep > WINDOW_MS) { sweep(now); lastSweep = now }

  const ip = getClientIp(request)
  if (ip !== "unknown" && isRateLimited(ip, now)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "10", "Cache-Control": "no-store" },
    })
  }

  const response = NextResponse.next()

  // Locale detection only matters for page navigations, not API calls.
  if (!request.nextUrl.pathname.startsWith("/api") && !request.cookies.get("locale")) {
    // Cloudflare injects this header automatically when proxying cPanel
    const cfCountry = request.headers.get("cf-ipcountry")
    if (cfCountry) {
      response.cookies.set("locale", cfCountry === "ET" ? "am" : "en", {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      })
    }
    // If no CF header, the client-side LocaleProvider will call /api/locale/detect
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|images).*)",
  ],
}
