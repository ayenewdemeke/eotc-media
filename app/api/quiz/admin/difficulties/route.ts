import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const difficulties = await prisma.qzDifficulty.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(difficulties)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const difficulty = await prisma.qzDifficulty.create({ data: { name: name.trim() } })
  return NextResponse.json(difficulty, { status: 201 })
}
