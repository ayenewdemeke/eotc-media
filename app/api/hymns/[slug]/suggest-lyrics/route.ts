import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const { slug } = await params
  const hymnId = parseInt(slug)

  const hymn = await prisma.hmHymn.findFirst({ where: { id: hymnId, userId }, select: { id: true } })
  if (!hymn) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const lyrics = typeof body.lyrics === 'string' ? body.lyrics.trim() : ''
  if (!lyrics) return NextResponse.json({ error: 'Lyrics required' }, { status: 400 })

  await prisma.hmHymn.update({
    where: { id: hymnId },
    data: { lyricsSuggestion: lyrics },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const { slug } = await params
  const hymnId = parseInt(slug)

  const hymn = await prisma.hmHymn.findFirst({ where: { id: hymnId, userId }, select: { id: true } })
  if (!hymn) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.hmHymn.update({ where: { id: hymnId }, data: { lyricsSuggestion: null } })
  return NextResponse.json({ success: true })
}
