import { prisma } from '@/lib/prisma'
import { BibleLanguage, BibleVersion, BlVerse } from '@/types/models/bible'

export async function getBooks() {
  // No categoryId in schema, so just return all books ordered by id
  const books = await prisma.blBook.findMany({
    orderBy: { id: 'asc' }
  });
  return { books };
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
  // Map UI language to database language codes
  const languageCodeMap: Record<string, string> = {
    'amharic': 'am',
    'english': 'en',
    'oromifa': 'om',
    'hebrew-greek': 'he',
    'greek': 'el',
  }

  const langCode = languageCodeMap[language] || language.substring(0, 2)

  // Try multiple strategies to find the right translation
  let translation = await prisma.blTranslation.findFirst({
    where: {
      OR: [
        // Try exact code match like "am-1954"
        { code: `${langCode}-${version}` },
        // Try language match
        { language: langCode },
        // Try code containing the version
        { code: { contains: version, mode: 'insensitive' } },
        // Try code containing the language
        { code: { contains: langCode, mode: 'insensitive' } },
      ]
    },
  });

  // If still no translation, get the first available one
  if (!translation) {
    translation = await prisma.blTranslation.findFirst();
  }

  if (!translation) {
    return { verses: [], chapterNumbers: [] };
  }

  // Find all verses for the book and chapter
  const verses = await prisma.blVerse.findMany({
    where: {
      bookId,
      chapter,
    },
    orderBy: { verse: 'asc' },
    include: {
      texts: {
        where: { translationId: translation.id },
        select: { text: true },
      },
    },
  });

  // Get all chapter numbers for this book
  const chapterResults = await prisma.blVerse.findMany({
    where: { bookId },
    select: { chapter: true },
    distinct: ['chapter'],
    orderBy: { chapter: 'asc' },
  });
  const chapterNumbers = chapterResults.map(r => r.chapter);

  // Fetch highlights if user is authenticated (using verseId reference)
  let highlights: any[] = [];
  if (userId) {
    const verseIds = verses.map(v => v.id);
    highlights = await prisma.blHighlight.findMany({
      where: {
        userId,
        verseId: { in: verseIds }
      },
    });
  }

  // Attach highlight info and flatten verse text
  const resultVerses = verses.map(verse => ({
    ...verse,
    text: verse.texts[0]?.text || '',
    highlight: highlights.find(h => h.verseId === verse.id)?.color || null,
  }));

  return { verses: resultVerses, chapterNumbers };
}

export async function searchBible(
  searchTerm: string,
  language: BibleLanguage,
  version: BibleVersion,
  scope: 'whole_bible' | 'old_testament' | 'new_testament' | 'current_book',
  currentBookId?: number
) {
  if (!searchTerm) return []

  let bookIds: number[] | undefined

  if (scope === 'old_testament' || scope === 'new_testament') {
    // No categoryId, so just get all book ids (or filter by some other logic if available)
    const books = await prisma.blBook.findMany({ select: { id: true } });
    bookIds = books.map(b => b.id);
  } else if (scope === 'current_book' && currentBookId) {
    bookIds = [currentBookId];
  }

  const whereClause: any = {
    text: {
      contains: searchTerm,
      mode: 'insensitive'
    }
  }

  if (bookIds) {
    whereClause.bookId = { in: bookIds }
  }

  let verses: any[] = []

  if (language === 'english' && version === 'kjv') {
    verses = await prisma.blEnglishKjvBible.findMany({
      where: whereClause,
      include: { book: true },
      take: 100
    })
  } else if (language === 'amharic' && version === '1954') {
    verses = await prisma.blAmharic1954Bible.findMany({
      where: whereClause,
      include: { book: true },
      take: 100
    })
  } else if (language === 'oromifa' && version === 'v1') {
    verses = await prisma.blOromifaBible.findMany({
      where: whereClause,
      include: { book: true },
      take: 100
    })
  } else if (language === 'hebrew-greek' && version === 'masoretic-textus-receptus') {
    const hebrewVerses = await prisma.blHebrewMasoreticBible.findMany({
      where: { ...whereClause, bookId: { lt: 40 } },
      include: { book: true },
      take: 50
    })
    const greekVerses = await prisma.blGreekTextusReceptusBible.findMany({
      where: { ...whereClause, bookId: { gte: 40 } },
      include: { book: true },
      take: 50
    })
    verses = [...hebrewVerses, ...greekVerses]
  } else if (language === 'greek' && version === 'septuagint') {
    verses = await prisma.blGreekSeptuagintBible.findMany({
      where: whereClause,
      include: { book: true },
      take: 100
    })
  }

  return verses
}

export async function getHighlightedVerses(userId: number, language: BibleLanguage, version: BibleVersion) {
  const highlights = await prisma.blHighlight.findMany({
    where: { userId }
  })

  if (highlights.length === 0) return {}

  let verses: any[] = []

  const verseIds = highlights.map(h => `${h.bookId}:${h.chapter}:${h.verse}`)

  if (language === 'english' && version === 'kjv') {
    verses = await prisma.blEnglishKjvBible.findMany({
      where: {
        OR: highlights.map(h => ({
          bookId: h.bookId,
          chapter: h.chapter,
          verse: h.verse
        }))
      },
      include: { book: true }
    })
  } else if (language === 'amharic' && version === '1954') {
    verses = await prisma.blAmharic1954Bible.findMany({
      where: {
        OR: highlights.map(h => ({
          bookId: h.bookId,
          chapter: h.chapter,
          verse: h.verse
        }))
      },
      include: { book: true }
    })
  } else if (language === 'oromifa' && version === 'v1') {
    verses = await prisma.blOromifaBible.findMany({
      where: {
        OR: highlights.map(h => ({
          bookId: h.bookId,
          chapter: h.chapter,
          verse: h.verse
        }))
      },
      include: { book: true }
    })
  }

  // Add highlight color and group by book
  const versesWithHighlights = verses.map(verse => {
    const highlight = highlights.find(
      h => h.bookId === verse.bookId && h.chapter === verse.chapter && h.verse === verse.verse
    )
    return {
      ...verse,
      highlightColor: highlight?.color || null,
      bookName: verse.book?.[`${language.replace('-', '_')}Name`] || verse.book?.englishName
    }
  })

  // Group by book name
  const grouped = versesWithHighlights.reduce((acc: any, verse: any) => {
    if (!acc[verse.bookName]) {
      acc[verse.bookName] = []
    }
    acc[verse.bookName].push(verse)
    return acc
  }, {})

  return grouped
}
