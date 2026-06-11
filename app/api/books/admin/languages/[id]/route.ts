import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { name } = await req.json()
  const lang = await prisma.cbLanguage.update({ where: { id: parseInt(id) }, data: { name: name.trim(), updatedAt: new Date() } })
  return NextResponse.json(lang)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const inUse = await prisma.cbBookLanguage.count({ where: { languageId: parseInt(id) } })
  if (inUse > 0) return NextResponse.json({ error: `Cannot delete: ${inUse} book${inUse === 1 ? '' : 's'} still use this language.` }, { status: 409 })
  await prisma.cbLanguage.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
