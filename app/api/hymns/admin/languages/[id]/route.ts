import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  await prisma.hmLanguage.delete({ where: { id: parseInt(id) } })
  return new NextResponse(null, { status: 204 })
}
