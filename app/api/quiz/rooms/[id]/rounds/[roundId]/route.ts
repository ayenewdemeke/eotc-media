import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string; roundId: string }> }

// GET /api/quiz/rooms/[id]/rounds/[roundId] — get round state (used for polling)
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id, roundId } = await params
  const roomId = parseInt(id)
  const roundIdNum = parseInt(roundId)

  // Verify user is a member of the room
  const member = await prisma.qzRoomMember.findFirst({ where: { roomId, userId } })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const round = await prisma.qzRound.findFirst({
    where: { id: roundIdNum, roomId },
    include: {
      memberRounds: {
        include: { roomMember: { include: { user: { select: { id: true, name: true } } } } },
      },
      questions: {
        include: {
          question: {
            include: {
              choices: { orderBy: { id: 'asc' } },
              difficulty: true,
              categories: { include: { category: true } },
            },
          },
          answers: true,
        },
      },
      results: {
        orderBy: { rank: 'asc' },
      },
    },
  })

  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

  // Map to safe client payload: for active rounds, don't expose isCorrect on choices
  const safeQuestions = round.questions.map(rq => ({
    id: rq.id,
    questionId: rq.questionId,
    question: {
      id: rq.question.id,
      questionText: rq.question.questionText,
      difficulty: rq.question.difficulty,
      categories: rq.question.categories.map(c => c.category),
      // Only expose isCorrect when round is finished
      choices: rq.question.choices.map(c => ({
        id: c.id,
        choiceText: c.choiceText,
        isCorrect: round.status === 'finished' ? c.isCorrect : false,
      })),
    },
    myAnswer: rq.answers.find(a => a.userId === userId) ?? null,
  }))

  // Attach user info to results
  const resultsWithUsers = await Promise.all(
    round.results.map(async r => {
      const user = await prisma.user.findUnique({ where: { id: r.userId }, select: { id: true, name: true } })
      return { ...r, user }
    })
  )

  return NextResponse.json({
    ...round,
    questions: safeQuestions,
    results: resultsWithUsers,
  })
}

// DELETE /api/quiz/rooms/[id]/rounds/[roundId] — host deletes an unfinished
// (waiting/active) round, e.g. one that was abandoned and is blocking the room.
// Finished rounds are kept as history and cannot be deleted here.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id, roundId } = await params
  const roomId = parseInt(id)
  const roundIdNum = parseInt(roundId)

  const room = await prisma.qzRoom.findUnique({ where: { id: roomId } })
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (room.hostUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden — only the host can delete a round' }, { status: 403 })
  }

  const round = await prisma.qzRound.findFirst({ where: { id: roundIdNum, roomId } })
  if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (round.status === 'finished') {
    return NextResponse.json({ error: 'Finished rounds cannot be deleted' }, { status: 422 })
  }

  // Round questions, answers, results and member-round rows cascade on delete
  await prisma.qzRound.delete({ where: { id: roundIdNum } })

  return NextResponse.json({ ok: true })
}
