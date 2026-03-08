import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const hymnId = parseInt(id)

  const rejectedStatus = await prisma.hmApprovalStatus.findFirst({ where: { name: 'Rejected' } })
  if (!rejectedStatus) return NextResponse.json({ error: 'Rejection status not found' }, { status: 500 })

  const hymn = await prisma.hmHymn.update({
    where: { id: hymnId },
    data: { approvalStatusId: rejectedStatus.id },
  })

  return NextResponse.json({ success: true, hymnId: hymn.id })
}
