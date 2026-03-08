import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const hymnId = parseInt(id)

  const hymn = await prisma.hmHymn.findUnique({ where: { id: hymnId }, select: { lyricsSuggestion: true } })
  if (!hymn?.lyricsSuggestion) return NextResponse.json({ error: 'No suggestion' }, { status: 400 })

  await prisma.hmHymn.update({
    where: { id: hymnId },
    data: { lyrics: hymn.lyricsSuggestion, lyricsSuggestion: null },
  })

  return NextResponse.json({ success: true })
}
