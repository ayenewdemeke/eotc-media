import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const subCategories = await prisma.hmSubCategory.findMany({
    include: { category: { select: { id: true, name: true } } },
  })
  return NextResponse.json(subCategories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, categoryId } = await req.json()
  if (!name?.trim() || !categoryId) return NextResponse.json({ error: 'Name and categoryId required' }, { status: 400 })
  const subCategory = await prisma.hmSubCategory.create({ data: { name: name.trim(), categoryId: parseInt(categoryId) } })
  return NextResponse.json(subCategory, { status: 201 })
}
