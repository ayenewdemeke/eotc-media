import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const categories = await prisma.smCategory.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true, languageId: true },
    })
    return NextResponse.json(categories)
  } catch {
    // language_id column not yet migrated — return without it
    const categories = await prisma.smCategory.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true },
    })
    return NextResponse.json(categories)
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, languageId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const category = await prisma.smCategory.create({
    data: { name: name.trim(), languageId: languageId ?? null },
    select: { id: true, name: true, languageId: true },
  })
  return NextResponse.json(category, { status: 201 })
}
