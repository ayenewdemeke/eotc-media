import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name, categoryId } = await req.json()
  const sub = await prisma.cbSubCategory.update({
    where: { id: parseInt(id) },
    data: { name: name.trim(), categoryId: parseInt(String(categoryId)), updatedAt: new Date() },
  })
  return NextResponse.json(sub)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.cbSubCategory.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
