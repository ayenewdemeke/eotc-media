import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const sermonId = parseInt(id)

  const sermon = await prisma.smSermon.findUnique({ where: { id: sermonId }, select: { descriptionSuggestion: true } })
  if (!sermon?.descriptionSuggestion) return NextResponse.json({ error: 'No suggestion' }, { status: 400 })

  await prisma.smSermon.update({
    where: { id: sermonId },
    data: { description: sermon.descriptionSuggestion, descriptionSuggestion: null },
  })

  return NextResponse.json({ success: true })
}
