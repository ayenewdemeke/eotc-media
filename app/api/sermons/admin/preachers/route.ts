import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const preachers = await prisma.smPreacher.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(preachers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const preacher = await prisma.smPreacher.create({ data: { name: name.trim() } })
  return NextResponse.json(preacher, { status: 201 })
}
