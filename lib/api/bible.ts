import { prisma } from '@/lib/prisma'
import { BibleLanguage, BibleVersion, BlBook, BlVerse, BibleSearchResult } from '@/types/models/bible'

const LANGUAGE_CODE_MAP: Record<string, string> = {
  'amharic': 'am',
  'english': 'en',
  'oromifa': 'om',
}

function getBookNameForLanguage(book: BlBook, language: BibleLanguage): string {
  if (language === 'amharic') return book.amharicName ?? book.englishName
  if (language === 'oromifa') return book.oromifaName ?? book.englishName
  return book.englishName
}

async function resolveTranslation(language: BibleLanguage, version: BibleVersion) {
  const langCode = LANGUAGE_CODE_MAP[language] || language.substring(0, 2)
  let translation = await prisma.blTranslation.findFirst({
    where: {
      OR: [
        { code: `${langCode}-${version}` },
        { language: langCode },
        { code: { contains: version, mode: 'insensitive' } },
        { code: { contains: langCode, mode: 'insensitive' } },
      ]
    },
  })
  if (!translation) translation = await prisma.blTranslation.findFirst()
  return translation
}

export async function getBooks() {
  const books = await prisma.blBook.findMany({
    orderBy: { id: 'asc' }
  })
  return { books }
}

export async function getBook(bookId: number) {
  return await prisma.blBook.findUnique({
    where: { id: bookId }
  })
}

export async function getChapterVerses(
  language: BibleLanguage,
  version: BibleVersion,
  bookId: number,
  chapter: number,
  userId?: number
) {
  const translation = await resolveTranslation(language, version)

  if (!translation) {
    return { verses: [], chapterNumbers: [] }
  }

  const verses = await prisma.blVerse.findMany({
    where: { bookId, chapter },
    orderBy: { verse: 'asc' },
    include: {
      texts: {
        where: { translationId: translation.id },
        select: { text: true },
      },
    },
  })

  const chapterResults = await prisma.blVerse.findMany({
    where: { bookId },
    select: { chapter: true },
    distinct: ['chapter'],
    orderBy: { chapter: 'asc' },
  })
  const chapterNumbers = chapterResults.map(r => r.chapter)

  let highlights: Array<{ verseId: number; color: string | null }> = []
  if (userId) {
    const verseIds = verses.map(v => v.id)
    highlights = await prisma.blHighlight.findMany({
      where: { userId, verseId: { in: verseIds } },
      select: { verseId: true, color: true },
    })
  }

  const resultVerses: BlVerse[] = verses.map(verse => ({
    ...verse,
    text: verse.texts[0]?.text || '',
    highlight: highlights.find(h => h.verseId === verse.id)?.color || null,
  }))

  return { verses: resultVerses, chapterNumbers }
}

export async function searchBible(
  searchTerm: string,
  language: BibleLanguage,
  version: BibleVersion,
  scope: 'whole_bible' | 'old_testament' | 'new_testament' | 'current_book',
  currentBookId?: number
): Promise<BibleSearchResult[]> {
  if (!searchTerm || searchTerm.trim().length < 2) return []

  const translation = await resolveTranslation(language, version)
  if (!translation) return []

  const verseBookWhere: Record<string, unknown> = {}
  if (scope === 'old_testament') {
    verseBookWhere.bookId = { lte: 39 }
  } else if (scope === 'new_testament') {
    verseBookWhere.bookId = { gt: 39 }
  } else if (scope === 'current_book' && currentBookId) {
    verseBookWhere.bookId = currentBookId
  }

  const verseTexts = await prisma.blVerseText.findMany({
    where: {
      translationId: translation.id,
      text: { contains: searchTerm, mode: 'insensitive' },
      verse: Object.keys(verseBookWhere).length > 0 ? verseBookWhere : undefined,
    },
    include: {
      verse: {
        include: { book: true }
      }
    },
    take: 100,
    orderBy: [
      { verse: { bookId: 'asc' } },
      { verse: { chapter: 'asc' } },
      { verse: { verse: 'asc' } },
    ]
  })

  return verseTexts.map(vt => ({
    verseId: vt.verseId,
    bookId: vt.verse.bookId,
    bookName: getBookNameForLanguage(vt.verse.book as BlBook, language),
    chapter: vt.verse.chapter,
    verse: vt.verse.verse,
    text: vt.text,
  }))
}

export async function getHighlightedVerses(
  userId: number,
  language: BibleLanguage,
  version: BibleVersion
) {
  const translation = await resolveTranslation(language, version)
  if (!translation) return {}

  const highlights = await prisma.blHighlight.findMany({
    where: { userId },
    include: {
      verse: {
        include: {
          book: true,
          texts: {
            where: { translationId: translation.id },
            select: { text: true }
          }
        }
      }
    }
  })

  if (highlights.length === 0) return {}

  const grouped: Record<string, Array<{
    verseId: number
    bookId: number
    chapter: number
    verse: number
    text: string
    color: string | null
    bookName: string
  }>> = {}

  for (const h of highlights) {
    const bookName = getBookNameForLanguage(h.verse.book as BlBook, language)
    if (!grouped[bookName]) grouped[bookName] = []
    grouped[bookName].push({
      verseId: h.verseId,
      bookId: h.verse.bookId,
      chapter: h.verse.chapter,
      verse: h.verse.verse,
      text: h.verse.texts[0]?.text ?? '',
      color: h.color,
      bookName,
    })
  }

  return grouped
}
