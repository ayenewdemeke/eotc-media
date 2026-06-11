import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name } = await req.json()
  const cat = await prisma.cbCategory.update({ where: { id: parseInt(id) }, data: { name: name.trim(), updatedAt: new Date() } })
  return NextResponse.json(cat)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const [booksInUse, subCategoriesInUse] = await Promise.all([
    prisma.cbBookCategory.count({ where: { categoryId: parseInt(id) } }),
    prisma.cbSubCategory.count({ where: { categoryId: parseInt(id) } }),
  ])
  if (booksInUse > 0) return NextResponse.json({ error: `Cannot delete: ${booksInUse} book${booksInUse === 1 ? '' : 's'} still use this category.` }, { status: 409 })
  if (subCategoriesInUse > 0) return NextResponse.json({ error: `Cannot delete: ${subCategoriesInUse} sub-categor${subCategoriesInUse === 1 ? 'y' : 'ies'} still belong to this category.` }, { status: 409 })
  await prisma.cbCategory.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
