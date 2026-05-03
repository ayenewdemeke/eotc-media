import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // 1. Cloudflare header (works when Cloudflare proxies cPanel)
  const cfCountry = req.headers.get("cf-ipcountry")
  if (cfCountry) {
    return NextResponse.json({ locale: cfCountry === "ET" ? "am" : "en", source: "cf" })
  }

  // 2. Extract client IP from forwarded headers
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip")

  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return NextResponse.json({ locale: "en", source: "default" })
  }

  // 3. Free geolocation API — no key required, 1000 req/min limit
  try {
    const geo = await fetch(`https://ip-api.com/json/${ip}?fields=countryCode`, {
      next: { revalidate: 0 },
    })
    if (geo.ok) {
      const { countryCode } = await geo.json()
      return NextResponse.json({ locale: countryCode === "ET" ? "am" : "en", source: "ipapi" })
    }
  } catch {
    // fall through to default
  }

  return NextResponse.json({ locale: "en", source: "default" })
}
