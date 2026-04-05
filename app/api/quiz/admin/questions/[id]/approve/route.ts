import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const approved = await prisma.qzApprovalStatus.findFirst({
    where: { name: 'Accepted' },
  })
  if (!approved) return NextResponse.json({ error: 'Approved status not found' }, { status: 500 })

  const question = await prisma.qzQuestion.update({
    where: { id: parseInt(id) },
    data: { approvalStatusId: approved.id },
  })
  return NextResponse.json(question)
}
