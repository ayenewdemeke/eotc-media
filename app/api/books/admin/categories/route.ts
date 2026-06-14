import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const categories = await prisma.cbCategory.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, languageId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const cat = await prisma.cbCategory.create({
    data: {
      name: name.trim(),
      languageId: languageId ? parseInt(String(languageId)) : null,
      updatedAt: new Date(),
    },
  })
  return NextResponse.json(cat)
}
