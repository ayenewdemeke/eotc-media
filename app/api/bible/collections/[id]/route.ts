import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const collectionId = parseInt(id)
    const userId = parseInt(session.user.id)

    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'amharic'
    const version = searchParams.get('version') || '1954'
    const langCode = language === 'amharic' ? 'am' : language === 'oromifa' ? 'om' : 'en'

    const translation = await prisma.blTranslation.findFirst({
      where: { OR: [{ code: `${langCode}-${version}` }, { language: langCode }] },
    }) ?? await prisma.blTranslation.findFirst()

    const collection = await prisma.blCollection.findFirst({
      where: { id: collectionId, userId },
      include: {
        verses: {
          include: {
            verse: {
              include: {
                book: { select: { englishName: true, amharicName: true } },
                texts: translation
                  ? { where: { translationId: translation.id }, select: { text: true } }
                  : { take: 0 },
              },
            },
          },
          orderBy: [
            { verse: { bookId: 'asc' } },
            { verse: { chapter: 'asc' } },
            { verse: { verse: 'asc' } },
          ],
        },
      },
    })

    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: collection.id,
      name: collection.name,
      verses: collection.verses.map(cv => ({
        verseId: cv.verseId,
        bookId: cv.verse.bookId,
        bookEnglishName: cv.verse.book.englishName,
        bookAmharicName: cv.verse.book.amharicName,
        chapter: cv.verse.chapter,
        verseNum: cv.verse.verse,
        text: cv.verse.texts[0]?.text ?? '',
      })),
    })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
