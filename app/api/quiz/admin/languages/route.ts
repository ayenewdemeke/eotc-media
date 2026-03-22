import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const languages = await prisma.qzLanguage.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(languages)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const language = await prisma.qzLanguage.create({ data: { name: name.trim() } })
  return NextResponse.json(language, { status: 201 })
}
