import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const subs = await prisma.cbSubCategory.findMany({
    orderBy: { name: 'asc' },
    include: { category: true },
  })
  return NextResponse.json(subs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, categoryId } = await req.json()
  if (!name?.trim() || !categoryId) return NextResponse.json({ error: 'Name and category required' }, { status: 400 })
  const sub = await prisma.cbSubCategory.create({ data: { name: name.trim(), categoryId: parseInt(String(categoryId)), updatedAt: new Date() } })
  return NextResponse.json(sub)
}
