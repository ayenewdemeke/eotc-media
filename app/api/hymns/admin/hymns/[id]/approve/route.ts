import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const hymnId = parseInt(id)

  const body = await req.json()
  const { singerIds } = body

  if (!singerIds?.length) {
    return NextResponse.json({ error: 'At least one singer is required to accept a hymn' }, { status: 400 })
  }

  const [acceptedStatus, hymn] = await Promise.all([
    prisma.hmApprovalStatus.findFirst({ where: { name: 'Accepted' } }),
    prisma.hmHymn.findUnique({ where: { id: hymnId }, include: { channel: true } }),
  ])

  if (!acceptedStatus) return NextResponse.json({ error: 'Approval status not found' }, { status: 500 })
  if (!hymn) return NextResponse.json({ error: 'Hymn not found' }, { status: 404 })

  await prisma.hmHymn.update({
    where: { id: hymnId },
    data: { approvalStatusId: acceptedStatus.id },
  })

  await prisma.hmHymnSinger.createMany({
    data: singerIds.map((singerId: number) => ({ hymnId, singerId })),
    skipDuplicates: true,
  })

  // Auto-accept the channel if it is not already accepted
  if (hymn.channel.approvalStatusId !== acceptedStatus.id) {
    await prisma.hmChannel.update({
      where: { id: hymn.channel.id },
      data: { approvalStatusId: acceptedStatus.id },
    })
  }

  return NextResponse.json({ success: true, hymnId })
}
