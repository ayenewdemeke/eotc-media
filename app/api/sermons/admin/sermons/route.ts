import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const sermons = await prisma.smSermon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { approvalStatus: true, channel: true },
  })
  return NextResponse.json(sermons)
}
