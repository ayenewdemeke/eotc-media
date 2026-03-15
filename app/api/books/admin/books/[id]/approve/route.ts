import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const bookId = parseInt(id)
  const body = await req.json().catch(() => ({}))
  const { authorIds } = body as { authorIds?: number[] }

  const approved = await prisma.cbApprovalStatus.findFirst({ where: { name: { contains: 'Approved', mode: 'insensitive' } } })
  if (!approved) return NextResponse.json({ error: 'Approved status not found' }, { status: 500 })

  await prisma.cbBook.update({ where: { id: bookId }, data: { approvalStatusId: approved.id, updatedAt: new Date() } })

  if (authorIds?.length) {
    await prisma.cbAuthorBook.deleteMany({ where: { bookId } })
    await prisma.cbAuthorBook.createMany({ data: authorIds.map(aid => ({ bookId, authorId: aid, updatedAt: new Date() })) })
  }

  return NextResponse.json({ ok: true })
}
