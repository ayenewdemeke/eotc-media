import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { sermonId } = await request.json()
    if (!sermonId) {
      return NextResponse.json({ error: 'Missing sermonId' }, { status: 400 })
    }
    const userId = parseInt(session.user.id)
    const existing = await prisma.smFavorite.findFirst({ where: { userId, sermonId } })
    if (existing) {
      await prisma.smFavorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.smFavorite.create({ data: { userId, sermonId } })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Error toggling sermon favorite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
