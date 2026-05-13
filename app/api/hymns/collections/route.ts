import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const hymnId = req.nextUrl.searchParams.get('hymnId')
    ? parseInt(req.nextUrl.searchParams.get('hymnId')!)
    : null

  const collections = await prisma.hmCollection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { hymns: true } },
      ...(hymnId ? { hymns: { where: { hymnId }, select: { id: true } } } : {}),
    },
  })

  return NextResponse.json(
    collections.map(c => ({
      id: c.id,
      name: c.name,
      hymnCount: c._count.hymns,
      containsHymn: hymnId ? (c.hymns as { id: number }[]).length > 0 : undefined,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const collection = await prisma.hmCollection.create({
    data: { userId, name: name.trim() },
    include: { _count: { select: { hymns: true } } },
  })
  return NextResponse.json(
    { id: collection.id, name: collection.name, hymnCount: collection._count.hymns },
    { status: 201 }
  )
}
