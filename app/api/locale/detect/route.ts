import { NextRequest, NextResponse } from "next/server"

// Crawlers don't persist the locale cookie, so they'd hit this endpoint — and
// the external geo lookup below — on every single request. Short-circuit them.
const BOT_UA =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|ahrefs|semrush|mj12|dotbot|petal|bytespider|gptbot|claudebot|facebookexternalhit/i

export async function GET(req: NextRequest) {
  // 1. Cloudflare header (works when Cloudflare proxies cPanel)
  const cfCountry = req.headers.get("cf-ipcountry")
  if (cfCountry) {
    return NextResponse.json({ locale: cfCountry === "ET" ? "am" : "en", source: "cf" })
  }

  // 2. Bots: return default without any external call
  const ua = req.headers.get("user-agent") || ""
  if (BOT_UA.test(ua)) {
    return NextResponse.json({ locale: "en", source: "bot-default" })
  }

  // 3. Extract client IP from forwarded headers
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip")

  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return NextResponse.json({ locale: "en", source: "default" })
  }

  // 4. Free geolocation API — no key required, 1000 req/min limit.
  //    Hard-cap the wait so a slow upstream can't hold a process open.
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const geo = await fetch(`https://ip-api.com/json/${ip}?fields=countryCode`, {
      next: { revalidate: 0 },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (geo.ok) {
      const { countryCode } = await geo.json()
      return NextResponse.json({ locale: countryCode === "ET" ? "am" : "en", source: "ipapi" })
    }
  } catch {
    // fall through to default
  }

  return NextResponse.json({ locale: "en", source: "default" })
}
