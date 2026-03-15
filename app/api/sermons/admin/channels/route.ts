import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const channels = await prisma.smChannel.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  return NextResponse.json(channels)
}
