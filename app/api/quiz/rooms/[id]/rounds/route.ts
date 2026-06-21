import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// POST /api/quiz/rooms/[id]/rounds — host starts a new round
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const roomId = parseInt(id)

  const body = await req.json().catch(() => ({}))
  const categoryId   = body.categoryId   ? parseInt(body.categoryId)   : null
  const difficultyId = body.difficultyId ? parseInt(body.difficultyId) : null
  const languageId   = body.languageId   ? parseInt(body.languageId)   : null

  const room = await prisma.qzRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  })
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (room.hostUserId !== userId) return NextResponse.json({ error: 'Forbidden — only the host can start a round' }, { status: 403 })

  // Check no active/waiting round exists
  const existingActive = await prisma.qzRound.findFirst({
    where: { roomId, status: { in: ['waiting', 'active'] } },
  })
  if (existingActive) return NextResponse.json({ error: 'A round is already in progress' }, { status: 422 })

  const roundNumber = room.totalRoundsPlayed + 1

  const round = await prisma.qzRound.create({
    data: {
      roomId,
      roundNumber,
      status: 'waiting',
      timerSeconds: 30,
      categoryId,
      difficultyId,
      languageId,
      memberRounds: {
        create: room.members.map(m => ({ roomMemberId: m.id, isReady: false })),
      },
    },
    include: { memberRounds: true },
  })

  return NextResponse.json(round, { status: 201 })
}
