import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const languages = await prisma.hmLanguage.findMany()
  return NextResponse.json(languages)
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const language = await prisma.hmLanguage.create({ data: { name: name.trim() } })
  return NextResponse.json(language, { status: 201 })
}
