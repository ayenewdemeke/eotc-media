import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getRandomQuestions } from '@/lib/api/quiz'

type Params = { params: Promise<{ id: string; roundId: string }> }

// POST /api/quiz/rooms/[id]/rounds/[roundId]/ready — mark self as ready
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id, roundId } = await params
  const roomId = parseInt(id)
  const roundIdNum = parseInt(roundId)

  const round = await prisma.qzRound.findFirst({
    where: { id: roundIdNum, roomId },
    include: {
      memberRounds: { include: { roomMember: true } },
    },
  })
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  if (round.status !== 'waiting') return NextResponse.json({ error: 'Round is not in waiting state' }, { status: 422 })

  const memberRound = round.memberRounds.find(mr => mr.roomMember.userId === userId)
  if (!memberRound) return NextResponse.json({ error: 'You are not a member of this round' }, { status: 403 })

  await prisma.qzRoomMemberRound.update({
    where: { id: memberRound.id },
    data: { isReady: true },
  })

  const allOtherReady = round.memberRounds
    .filter(mr => mr.id !== memberRound.id)
    .every(mr => mr.isReady)

  if (allOtherReady) {
    // Pick 10 random questions using the round's stored filters
    const questions = await getRandomQuestions({
      categoryId:   round.categoryId   ?? undefined,
      difficultyId: round.difficultyId ?? undefined,
      languageId:   round.languageId   ?? undefined,
      count: 10,
    })

    const qIds = questions.map(q => q.id)
    // Shuffle
    for (let i = qIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[qIds[i], qIds[j]] = [qIds[j], qIds[i]]
    }

    const timerSeconds = qIds.length * 30

    await prisma.qzRound.update({
      where: { id: roundIdNum },
      data: {
        status: 'active',
        startedAt: new Date(),
        timerSeconds,
        questions: {
          create: qIds.map(qId => ({ questionId: qId })),
        },
      },
    })

    return NextResponse.json({ activated: true, questionCount: qIds.length })
  }

  return NextResponse.json({ ready: true, activated: false })
}
