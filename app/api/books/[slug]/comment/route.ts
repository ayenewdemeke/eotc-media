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

  const { comment } = await req.json()
  if (!comment?.trim()) return NextResponse.json({ error: 'Comment is required' }, { status: 400 })

  const userId = parseInt(session.user.id)
  const created = await prisma.cbBookComment.create({
    data: { userId, bookId: book.id, comment: comment.trim(), updatedAt: new Date() },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json({
    id: created.id,
    bookId: created.bookId,
    userId: created.userId,
    comment: created.comment,
    createdAt: created.createdAt.toISOString(),
    user: created.user,
  })
}
