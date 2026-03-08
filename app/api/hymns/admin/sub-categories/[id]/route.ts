import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name, categoryId } = await req.json()
  const data: Record<string, unknown> = {}
  if (name?.trim()) data.name = name.trim()
  if (categoryId) data.categoryId = parseInt(categoryId)
  const sc = await prisma.hmSubCategory.update({ where: { id: parseInt(id) }, data })
  return NextResponse.json(sc)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.hmSubCategory.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
