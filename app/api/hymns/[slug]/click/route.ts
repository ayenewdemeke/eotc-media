import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'clicked_hymns'
const MAX_IDS = 500 // cap to stay safely under the 4KB cookie limit

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params
    const slug = (() => { try { return decodeURIComponent(rawSlug) } catch { return rawSlug } })()

    const hymn = await prisma.hmHymn.findUnique({ where: { slug }, select: { id: true } })
    if (!hymn) return NextResponse.json({ success: false })

    // Read the session-like cookie
    const raw = request.cookies.get(COOKIE_NAME)?.value ?? ''
    const clicked = raw ? raw.split(',').map(Number).filter(Boolean) : []

    if (clicked.includes(hymn.id)) {
      // Already counted this session — skip
      return NextResponse.json({ success: true })
    }

    // Increment the count
    await prisma.hmHymn.update({
      where: { slug },
      data: { clicksCount: { increment: 1 } },
    })

    // Write the updated cookie (keep last MAX_IDS to prevent overflow)
    const updated = [...clicked, hymn.id].slice(-MAX_IDS)
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, updated.join(','), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 30, // 30 minutes
      sameSite: 'lax',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
