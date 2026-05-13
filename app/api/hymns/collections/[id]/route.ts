import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const collection = await prisma.hmCollection.findFirst({
    where: { id: parseInt(id), userId },
    include: {
      hymns: {
        orderBy: { createdAt: 'asc' },
        include: {
          hymn: {
            include: {
              categories:    { include: { category: true } },
              subCategories: { include: { subCategory: true } },
              languages:     { include: { language: true } },
              singers:       { include: { singer: true } },
              channel:       true,
            },
          },
        },
      },
    },
  })
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    id: collection.id,
    name: collection.name,
    hymns: collection.hymns.map(ch => ch.hymn),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const existing = await prisma.hmCollection.findFirst({ where: { id: parseInt(id), userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await prisma.hmCollection.update({
    where: { id: parseInt(id) },
    data: { name: name.trim() },
  })
  return NextResponse.json({ id: updated.id, name: updated.name })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const existing = await prisma.hmCollection.findFirst({ where: { id: parseInt(id), userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.hmCollection.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
