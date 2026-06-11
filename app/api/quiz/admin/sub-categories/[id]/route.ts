import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name, categoryId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const subCategory = await prisma.qzSubCategory.update({
    where: { id: parseInt(id) },
    data: { name: name.trim(), ...(categoryId ? { categoryId: parseInt(String(categoryId)) } : {}) },
  })
  return NextResponse.json(subCategory)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const inUse = await prisma.qzQuestionSubCategory.count({ where: { subCategoryId: parseInt(id) } })
  if (inUse > 0) return NextResponse.json({ error: `Cannot delete: ${inUse} question${inUse === 1 ? '' : 's'} still use this sub-category.` }, { status: 409 })
  await prisma.qzSubCategory.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
