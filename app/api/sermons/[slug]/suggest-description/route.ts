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
  const sermonId = parseInt(slug)

  const sermon = await prisma.smSermon.findFirst({ where: { id: sermonId, userId }, select: { id: true } })
  if (!sermon) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!description) return NextResponse.json({ error: 'Description required' }, { status: 400 })

  await prisma.smSermon.update({
    where: { id: sermonId },
    data: { descriptionSuggestion: description },
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
  const sermonId = parseInt(slug)

  const sermon = await prisma.smSermon.findFirst({ where: { id: sermonId, userId }, select: { id: true } })
  if (!sermon) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.smSermon.update({ where: { id: sermonId }, data: { descriptionSuggestion: null } })
  return NextResponse.json({ success: true })
}
