import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const collectionId = parseInt(id)
    const userId = parseInt(session.user.id)
    const collection = await prisma.blCollection.findFirst({ where: { id: collectionId, userId } })
    if (!collection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { verseIds } = await request.json()
    if (!Array.isArray(verseIds) || verseIds.length === 0) {
      return NextResponse.json({ error: 'verseIds array required' }, { status: 400 })
    }
    await prisma.blCollectionVerse.createMany({
      data: verseIds.map((verseId: number) => ({ collectionId, verseId })),
      skipDuplicates: true,
    })
    // Update collection updatedAt
    await prisma.blCollection.update({ where: { id: collectionId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding verses to collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const collectionId = parseInt(id)
    const userId = parseInt(session.user.id)
    const collection = await prisma.blCollection.findFirst({ where: { id: collectionId, userId } })
    if (!collection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { verseId } = await request.json()
    if (!verseId) {
      return NextResponse.json({ error: 'verseId required' }, { status: 400 })
    }
    await prisma.blCollectionVerse.deleteMany({ where: { collectionId, verseId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing verse from collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
