import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const book = await prisma.cbBook.findUnique({ where: { slug } })
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userId = parseInt(session.user.id)
  const existing = await prisma.cbLike.findUnique({ where: { userId_bookId: { userId, bookId: book.id } } })

  if (existing) {
    await prisma.cbLike.delete({ where: { userId_bookId: { userId, bookId: book.id } } })
    return NextResponse.json({ liked: false })
  } else {
    await prisma.cbLike.create({ data: { userId, bookId: book.id, updatedAt: new Date() } })
    return NextResponse.json({ liked: true })
  }
}
