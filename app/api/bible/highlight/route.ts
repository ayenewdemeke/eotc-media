import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookId, chapter, verse, color } = await request.json()

    if (!bookId || !chapter || !verse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    // First, find the verse by bookId, chapter, and verse number
    const verseRecord = await prisma.blVerse.findFirst({
      where: {
        bookId,
        chapter,
        verse
      }
    })

    if (!verseRecord) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 })
    }

    // Check if highlight exists for this user and verse
    const existingHighlight = await prisma.blHighlight.findFirst({
      where: {
        userId,
        verseId: verseRecord.id
      }
    })

    if (existingHighlight) {
      if (!color) {
        // Remove highlight
        await prisma.blHighlight.delete({
          where: { id: existingHighlight.id }
        })
      } else {
        // Update highlight color
        await prisma.blHighlight.update({
          where: { id: existingHighlight.id },
          data: { color }
        })
      }
    } else if (color) {
      // Create new highlight using verseId
      await prisma.blHighlight.create({
        data: {
          userId,
          verseId: verseRecord.id,
          color
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling highlight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
