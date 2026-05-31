import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { finalizeRound } from '@/lib/quiz-finalize-round'

type Params = { params: Promise<{ id: string; roundId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, roundId } = await params
  const roomId = parseInt(id)
  const roundIdNum = parseInt(roundId)

  const round = await prisma.qzRound.findFirst({
    where: { id: roundIdNum, roomId },
    select: { status: true, startedAt: true, timerSeconds: true },
  })
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

  // Idempotent — already done
  if (round.status === 'finished') return NextResponse.json({ ok: true })
  if (round.status !== 'active') return NextResponse.json({ error: 'Round is not active' }, { status: 422 })

  // Verify timer has actually expired
  if (round.startedAt) {
    const elapsed = (Date.now() - new Date(round.startedAt).getTime()) / 1000
    if (elapsed < round.timerSeconds) {
      return NextResponse.json({ error: 'Timer has not expired' }, { status: 422 })
    }
  }

  await finalizeRound(roundIdNum)
  return NextResponse.json({ ok: true })
}
