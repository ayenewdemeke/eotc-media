import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name, languageId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const category = await prisma.qzCategory.update({ where: { id: parseInt(id) }, data: { name: name.trim(), languageId: languageId ?? null } })
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const [questionsInUse, subCategoriesInUse] = await Promise.all([
    prisma.qzCategoryQuestion.count({ where: { categoryId: parseInt(id) } }),
    prisma.qzSubCategory.count({ where: { categoryId: parseInt(id) } }),
  ])
  if (questionsInUse > 0) return NextResponse.json({ error: `Cannot delete: ${questionsInUse} question${questionsInUse === 1 ? '' : 's'} still use this category.` }, { status: 409 })
  if (subCategoriesInUse > 0) return NextResponse.json({ error: `Cannot delete: ${subCategoriesInUse} sub-categor${subCategoriesInUse === 1 ? 'y' : 'ies'} still belong to this category.` }, { status: 409 })
  await prisma.qzCategory.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
