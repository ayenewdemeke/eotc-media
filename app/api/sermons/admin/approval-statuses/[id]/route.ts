import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const inUse = await prisma.smSermon.count({ where: { approvalStatusId: parseInt(id) } })
  if (inUse > 0) return NextResponse.json({ error: `Cannot delete: ${inUse} sermon${inUse === 1 ? '' : 's'} still use this status.` }, { status: 409 })
  await prisma.smApprovalStatus.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
