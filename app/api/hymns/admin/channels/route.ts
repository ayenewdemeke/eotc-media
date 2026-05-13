import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const channels = await prisma.hmChannel.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  })
  return NextResponse.json(channels.map(c => ({ id: c.id, name: c.title })))
}
