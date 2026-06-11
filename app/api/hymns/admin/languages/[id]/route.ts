import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const language = await prisma.hmLanguage.update({
    where: { id: parseInt(id) },
    data: { name: name.trim() },
  })
  return NextResponse.json(language)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const inUse = await prisma.hmHymnLanguage.count({ where: { languageId: parseInt(id) } })
  if (inUse > 0) return NextResponse.json({ error: `Cannot delete: ${inUse} hymn${inUse === 1 ? '' : 's'} still use this language.` }, { status: 409 })
  await prisma.hmLanguage.delete({ where: { id: parseInt(id) } })
  return new NextResponse(null, { status: 204 })
}
