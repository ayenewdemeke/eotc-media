import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const subCategories = await prisma.smSubCategory.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(subCategories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, categoryId } = await req.json()
  if (!name?.trim() || !categoryId) return NextResponse.json({ error: 'Name and categoryId required' }, { status: 400 })
  const sub = await prisma.smSubCategory.create({ data: { name: name.trim(), categoryId: parseInt(String(categoryId)) } })
  return NextResponse.json(sub, { status: 201 })
}
