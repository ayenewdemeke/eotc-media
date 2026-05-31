import { prisma } from '@/lib/prisma'

export async function finalizeRound(roundId: number): Promise<void> {
  // Atomically claim finalization — only the first concurrent caller gets count=1
  const { count } = await prisma.qzRound.updateMany({
    where: { id: roundId, status: 'active' },
    data: { status: 'finished', endedAt: new Date() },
  })
  if (count === 0) return // Already finished or not active

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

  const scores: Record<number, number> = {}
  for (const rq of round.questions) {
    const correctIds = new Set(rq.question.choices.filter(c => c.isCorrect).map(c => c.id))
    for (const answer of rq.answers) {
      if (correctIds.has(answer.choiceId)) {
        scores[answer.userId] = (scores[answer.userId] ?? 0) + 1
      }
    }
  }

  const allUserIds = round.memberRounds.map(mr => mr.roomMember.userId)
  const sorted = allUserIds
    .map(uid => ({ userId: uid, score: scores[uid] ?? 0 }))
    .sort((a, b) => b.score - a.score)

  const results: { userId: number; score: number; rank: number }[] = []
  let rank = 1
  sorted.forEach((entry, idx) => {
    if (idx > 0 && entry.score < sorted[idx - 1].score) rank = idx + 1
    results.push({ userId: entry.userId, score: entry.score, rank })
  })

  await prisma.$transaction([
    prisma.qzRoundResult.createMany({ data: results.map(r => ({ roundId, ...r })) }),
    prisma.qzRoom.update({
      where: { id: round.roomId },
      data: { totalRoundsPlayed: { increment: 1 } },
    }),
  ])
}
