import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'
import { sortLanguages } from '@/lib/language-order'

export async function GET() {
  const languages = await prisma.cbLanguage.findMany()
  return NextResponse.json(sortLanguages(languages))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const lang = await prisma.cbLanguage.create({ data: { name: name.trim(), updatedAt: new Date() } })
  return NextResponse.json(lang)
}
