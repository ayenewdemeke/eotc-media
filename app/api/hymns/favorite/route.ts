import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hymnId } = await request.json()
    if (!hymnId) {
      return NextResponse.json({ error: 'Missing hymnId' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    const existing = await prisma.hmFavorite.findFirst({
      where: { userId, hymnId },
    })

    if (existing) {
      await prisma.hmFavorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.hmFavorite.create({ data: { userId, hymnId } })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
