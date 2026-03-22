import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const subCategories = await prisma.qzSubCategory.findMany({
    orderBy: { id: 'asc' },
    include: { category: true },
  })
  return NextResponse.json(subCategories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, categoryId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  if (!categoryId) return NextResponse.json({ error: 'Category required' }, { status: 400 })
  const subCategory = await prisma.qzSubCategory.create({
    data: { name: name.trim(), categoryId: parseInt(String(categoryId)) },
  })
  return NextResponse.json(subCategory, { status: 201 })
}
