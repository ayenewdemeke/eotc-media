import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    await prisma.smSermon.update({
      where: { slug },
      data: { clicksCount: { increment: 1 } },
    })
  } catch { /* ignore if not found */ }
  return NextResponse.json({ ok: true })
}
