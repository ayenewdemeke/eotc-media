import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { finalizeRound } from '@/lib/quiz-finalize-round'

type Params = { params: Promise<{ id: string; roundId: string }> }

// POST /api/quiz/rooms/[id]/rounds/[roundId]/answer — submit an answer for a round question
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id, roundId } = await params
  const roomId = parseInt(id)
  const roundIdNum = parseInt(roundId)

  const { roundQuestionId, choiceId } = await req.json().catch(() => ({}))
  if (!roundQuestionId || !choiceId) return NextResponse.json({ error: 'roundQuestionId and choiceId are required' }, { status: 422 })

  const round = await prisma.qzRound.findFirst({
    where: { id: roundIdNum, roomId },
    include: {
      questions: { include: { answers: true } },
      memberRounds: { include: { roomMember: true } },
    },
  })
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  if (round.status !== 'active') return NextResponse.json({ error: 'Round is not active' }, { status: 422 })

  // Check timer
  if (round.startedAt) {
    const elapsed = (Date.now() - new Date(round.startedAt).getTime()) / 1000
    if (elapsed > round.timerSeconds) {
      return NextResponse.json({ error: 'Time has expired' }, { status: 422 })
    }
  }

  // Verify roundQuestion belongs to this round
  const roundQuestion = round.questions.find(rq => rq.id === roundQuestionId)
  if (!roundQuestion) return NextResponse.json({ error: 'Question not found in this round' }, { status: 404 })

  // Prevent duplicate answers
  const alreadyAnswered = roundQuestion.answers.some(a => a.userId === userId)
  if (alreadyAnswered) return NextResponse.json({ error: 'Already answered' }, { status: 422 })

  // Verify choice belongs to the question
  const choice = await prisma.qzChoice.findFirst({
    where: { id: choiceId, questionId: roundQuestion.questionId },
  })
  if (!choice) return NextResponse.json({ error: 'Invalid choice' }, { status: 422 })

  // Save answer
  await prisma.qzRoundAnswer.create({
    data: { roundQuestionId, userId, choiceId },
  })

  // Check if all members have answered all questions — if so, finalize
  const memberCount = round.memberRounds.length
  const questionCount = round.questions.length
  const totalAnswersNeeded = memberCount * questionCount

  const currentAnswers = await prisma.qzRoundAnswer.count({
    where: { roundQuestion: { roundId: roundIdNum } },
  })

  if (currentAnswers >= totalAnswersNeeded) {
    await finalizeRound(roundIdNum)
  }

  return NextResponse.json({ ok: true, isCorrect: choice.isCorrect })
}
