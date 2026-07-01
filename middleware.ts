import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ── In-memory rate limiter (bot-flood protection for shared hosting) ──────────
// Deliberately GENEROUS: only sustained, high-rate crawlers should ever hit it.
// Normal browsing must never trip it, so two things matter:
//   1) Next.js fires many background prefetch requests per page — those are NOT
//      counted (a single visitor could otherwise burst past the limit).
//   2) The cap is ~30 req/s per IP; a human never sustains that, a crawler does.
const WINDOW_MS = 10_000
const MAX_REQUESTS = 300
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

// If we can't resolve a real public client IP, DON'T rate-limit — otherwise a
// missing/loopback/private/proxy address would collapse every visitor onto one
// shared bucket and 429 everyone.
function isUnusableIp(ip: string): boolean {
  return (
    !ip ||
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  )
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
  // Never count Next.js prefetch requests — one page navigation can fire many.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "prefetch"

  if (!isPrefetch) {
    const now = Date.now()
    if (now - lastSweep > WINDOW_MS) { sweep(now); lastSweep = now }
    const ip = getClientIp(request)
    if (!isUnusableIp(ip) && isRateLimited(ip, now)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "10", "Cache-Control": "no-store" },
      })
    }
  }

  const response = NextResponse.next()

  // If locale cookie already set, nothing to do
  if (request.cookies.get("locale")) return response

  // Cloudflare injects this header automatically when proxying cPanel
  const cfCountry = request.headers.get("cf-ipcountry")
  if (cfCountry) {
    const locale = cfCountry === "ET" ? "am" : "en"
    response.cookies.set("locale", locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    })
  }
  // If no CF header, the client-side LocaleProvider will call /api/locale/detect

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|images).*)",
  ],
}
