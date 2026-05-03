import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
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
