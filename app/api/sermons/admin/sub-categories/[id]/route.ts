import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name, categoryId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const data: Record<string, unknown> = { name: name.trim() }
  if (categoryId) data.categoryId = parseInt(String(categoryId))
  const sub = await prisma.smSubCategory.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(sub)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const inUse = await prisma.smSermonSubCategory.count({ where: { subCategoryId: parseInt(id) } })
  if (inUse > 0) return NextResponse.json({ error: `Cannot delete: ${inUse} sermon${inUse === 1 ? '' : 's'} still use this sub-category.` }, { status: 409 })
  await prisma.smSubCategory.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
