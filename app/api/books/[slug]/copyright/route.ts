import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const book = await prisma.cbBook.findUnique({ where: { slug } })
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { reason, remove } = await req.json()
  const userId = parseInt(session.user.id)

  if (remove) {
    await prisma.cbCopyrightReport.deleteMany({ where: { userId, bookId: book.id } })
    return NextResponse.json({ reported: false })
  }

  const existing = await prisma.cbCopyrightReport.findFirst({ where: { userId, bookId: book.id } })
  if (existing) return NextResponse.json({ reported: true })

  await prisma.cbCopyrightReport.create({
    data: { userId, bookId: book.id, reason: reason?.trim() || '', updatedAt: new Date() },
  })
  return NextResponse.json({ reported: true })
}
