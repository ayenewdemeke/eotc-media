import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)
  const { id } = await params
  const collectionId = parseInt(id)
  const { hymnId } = await req.json()
  if (!hymnId) return NextResponse.json({ error: 'hymnId required' }, { status: 400 })

  const collection = await prisma.hmCollection.findFirst({ where: { id: collectionId, userId } })
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.hmCollectionHymn.findFirst({ where: { collectionId, hymnId } })
  if (existing) {
    await prisma.hmCollectionHymn.delete({ where: { id: existing.id } })
    return NextResponse.json({ inCollection: false })
  } else {
    await prisma.hmCollectionHymn.create({ data: { collectionId, hymnId } })
    await prisma.hmCollection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ inCollection: true })
  }
}
