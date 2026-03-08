import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hymnId, comment } = await request.json()
    if (!hymnId || !comment?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    const now = new Date()
    const newComment = await prisma.hmComment.create({
      data: { userId, hymnId, comment: comment.trim(), updatedAt: now },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json({
      id: newComment.id,
      userId: newComment.userId,
      hymnId: newComment.hymnId,
      comment: newComment.comment,
      createdAt: newComment.createdAt,
      user: newComment.user,
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
