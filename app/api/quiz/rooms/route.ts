import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/quiz/rooms — list rooms where current user is a member
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const rooms = await prisma.qzRoom.findMany({
    where: { members: { some: { userId } } },
    include: {
      host: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
      rounds: { orderBy: { roundNumber: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(rooms)
}

// POST /api/quiz/rooms — create a new room
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const { name } = await req.json().catch(() => ({}))

  const roomCode = '#' + Math.random().toString(36).substring(2, 8).toUpperCase()

  const room = await prisma.qzRoom.create({
    data: {
      hostUserId: userId,
      name: name?.trim() || null,
      roomCode,
      status: 'waiting',
      members: { create: { userId } },
    },
    include: {
      host: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  })

  return NextResponse.json(room, { status: 201 })
}
