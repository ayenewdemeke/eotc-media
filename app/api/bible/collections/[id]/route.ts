import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { name, description } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const updated = await prisma.blCollection.update({
      where: { id: collectionId },
      data: { name: name.trim(), description: description?.trim() || null },
      include: { _count: { select: { verses: true } } },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    await prisma.blCollection.delete({ where: { id: collectionId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
