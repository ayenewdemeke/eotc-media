import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const sermonId = parseInt(id)
  const body = await req.json()
  const { preacherIds } = body

  if (!preacherIds?.length) {
    return NextResponse.json({ error: 'At least one preacher is required' }, { status: 400 })
  }

  const acceptedStatus = await prisma.smApprovalStatus.findFirst({ where: { name: 'Accepted' } })
  if (!acceptedStatus) return NextResponse.json({ error: 'Status not found' }, { status: 500 })

  await prisma.smSermon.update({
    where: { id: sermonId },
    data: { approvalStatusId: acceptedStatus.id, updatedAt: new Date() },
  })

  await prisma.smPreacherSermon.createMany({
    data: preacherIds.map((pid: number) => ({ preacherId: pid, sermonId })),
    skipDuplicates: true,
  })

  return NextResponse.json({ ok: true })
}
