import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 24

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)

  const [channels, total] = await Promise.all([
    prisma.smChannel.findMany({
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { sermons: true } } },
    }),
    prisma.smChannel.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  return NextResponse.json({ channels, total, page, totalPages })
}
