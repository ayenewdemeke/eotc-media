import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET /api/quiz/rooms/[id] — get room state (used for polling)
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const roomId = parseInt(id)

  const room = await prisma.qzRoom.findUnique({
    where: { id: roomId },
    include: {
      host: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
      rounds: {
        orderBy: { roundNumber: 'asc' },
        include: {
          results: {
            include: { round: false },
            orderBy: { rank: 'asc' },
          },
          memberRounds: true,
        },
      },
    },
  })

  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  const isMember = room.members.some(m => m.userId === userId)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Aggregate scores from round results for each member
  const memberScores: Record<number, { totalScore: number; roundsWon: number }> = {}
  room.members.forEach(m => { memberScores[m.userId] = { totalScore: 0, roundsWon: 0 } })
  room.rounds.forEach(round => {
    round.results.forEach((r, idx) => {
      if (memberScores[r.userId]) {
        memberScores[r.userId].totalScore += r.score
        if (r.rank === 1) memberScores[r.userId].roundsWon += 1
      }
    })
  })

  const membersWithScores = room.members.map(m => ({
    ...m,
    totalScore: memberScores[m.userId]?.totalScore ?? 0,
    roundsWon: memberScores[m.userId]?.roundsWon ?? 0,
  }))

  return NextResponse.json({ ...room, members: membersWithScores })
}

// DELETE /api/quiz/rooms/[id] — delete room (host only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const roomId = parseInt(id)

  const room = await prisma.qzRoom.findUnique({ where: { id: roomId } })
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (room.hostUserId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.qzRoom.delete({ where: { id: roomId } })
  return NextResponse.json({ ok: true })
}
