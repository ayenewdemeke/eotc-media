import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const types = await prisma.qzQuestionType.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(types)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const type = await prisma.qzQuestionType.create({ data: { name: name.trim() } })
  return NextResponse.json(type, { status: 201 })
}
