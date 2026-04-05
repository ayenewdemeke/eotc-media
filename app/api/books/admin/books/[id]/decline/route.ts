import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const rejected = await prisma.cbApprovalStatus.findFirst({ where: { name: 'Declined' } })
  if (!rejected) return NextResponse.json({ error: 'Rejected status not found' }, { status: 500 })

  await prisma.cbBook.update({ where: { id: parseInt(id) }, data: { approvalStatusId: rejected.id, updatedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
