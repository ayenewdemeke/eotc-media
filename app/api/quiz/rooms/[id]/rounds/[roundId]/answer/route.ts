import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

async function finalizeRound(roundId: number) {
  const round = await prisma.qzRound.findUnique({
    where: { id: roundId },
    include: {
      memberRounds: { include: { roomMember: true } },
      questions: {
        include: {
          question: { include: { choices: { select: { id: true, isCorrect: true } } } },
          answers: { select: { userId: true, choiceId: true } },
        },
      },
    },
  })
  if (!round) return

  // Score per user: count correct answers
  const scores: Record<number, number> = {}
  for (const rq of round.questions) {
    const correctIds = new Set(rq.question.choices.filter(c => c.isCorrect).map(c => c.id))
    for (const answer of rq.answers) {
      if (correctIds.has(answer.choiceId)) {
        scores[answer.userId] = (scores[answer.userId] ?? 0) + 1
      }
    }
  }

  // Collect all member user ids
  const allUserIds = round.memberRounds.map(mr => mr.roomMember.userId)

  // Build sorted results with rank (ties share rank)
  const sorted = allUserIds
    .map(uid => ({ userId: uid, score: scores[uid] ?? 0 }))
    .sort((a, b) => b.score - a.score)

  const results: { userId: number; score: number; rank: number }[] = []
  let rank = 1
  sorted.forEach((entry, idx) => {
    if (idx > 0 && entry.score < sorted[idx - 1].score) rank = idx + 1
    results.push({ userId: entry.userId, score: entry.score, rank })
  })

  // Save results and mark round finished
  await prisma.$transaction([
    prisma.qzRoundResult.createMany({ data: results.map(r => ({ roundId, ...r })) }),
    prisma.qzRound.update({
      where: { id: roundId },
      data: { status: 'finished', endedAt: new Date() },
    }),
    prisma.qzRoom.update({
      where: { id: round.roomId },
      data: { totalRoundsPlayed: { increment: 1 } },
    }),
  ])
}
