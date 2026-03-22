import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST /api/quiz/rooms/join — join a room by room code
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const { code } = await req.json().catch(() => ({}))
  if (!code?.trim()) return NextResponse.json({ error: 'Room code is required' }, { status: 422 })

  const room = await prisma.qzRoom.findUnique({
    where: { roomCode: code.trim().toUpperCase() },
    include: { members: true },
  })
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  const alreadyMember = room.members.some(m => m.userId === userId)
  if (!alreadyMember) {
    await prisma.qzRoomMember.create({ data: { roomId: room.id, userId } })
  }

  return NextResponse.json({ roomId: room.id })
}
