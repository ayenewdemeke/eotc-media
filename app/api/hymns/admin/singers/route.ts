import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const singers = await prisma.hmSinger.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(singers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const singer = await prisma.hmSinger.create({ data: { name: name.trim() } })
  return NextResponse.json(singer, { status: 201 })
}
