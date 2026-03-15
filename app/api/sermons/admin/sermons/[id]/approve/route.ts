import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const approved = await prisma.smApprovalStatus.findFirst({ where: { name: 'Approved' } })
  if (!approved) return NextResponse.json({ error: 'Status not found' }, { status: 500 })
  await prisma.smSermon.update({ where: { id: parseInt(id) }, data: { approvalStatusId: approved.id, updatedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
