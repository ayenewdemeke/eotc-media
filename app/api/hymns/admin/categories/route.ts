import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const categories = await prisma.hmCategory.findMany()
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, languageId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const category = await prisma.hmCategory.create({
    data: {
      name: name.trim(),
      languageId: languageId ? parseInt(String(languageId)) : null,
    },
  })
  return NextResponse.json(category, { status: 201 })
}
