import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkMainAdminAccess } from "@/lib/auth-helpers"
import { scanChapterWithGemini, VerseScanInput } from "@/lib/bible-corrections"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const { translationCode, bookId, chapter } = await req.json()
  if (!translationCode || !bookId || !chapter) {
    return NextResponse.json({ error: "translationCode, bookId, and chapter are required" }, { status: 400 })
  }

  const translation = await prisma.blTranslation.findUnique({ where: { code: translationCode } })
  if (!translation) return NextResponse.json({ error: "Translation not found" }, { status: 404 })

  const book = await prisma.blBook.findUnique({ where: { id: bookId } })
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 })

  // Fetch all BlVerse records for this book/chapter, LEFT JOIN BlVerseText for this translation
  const verses = await prisma.blVerse.findMany({
    where: { bookId, chapter },
    orderBy: { verse: "asc" },
    include: {
      texts: {
        where: { translationId: translation.id },
        select: { text: true },
      },
    },
  })

  const verseInputs: VerseScanInput[] = verses.map(v => ({
    verseId: v.id,
    verseNum: v.verse,
    text: v.texts[0]?.text ?? "",
  }))

  const knownVerseNumToId = new Map(verses.map(v => [v.verse, v.id]))

  const suggestions = await scanChapterWithGemini(
    {
      translationName: translation.name,
      bookName: book.englishName,
      chapter,
    },
    verseInputs
  )

  // Tag suggestions whose verseNum has no BlVerse record
  const enriched = suggestions.map(s => {
    if (s.verseId === null && !knownVerseNumToId.has(s.verseNum)) {
      return { ...s, warning: "no_verse_record" as const }
    }
    // If Gemini returned verseId: null but the verseNum exists, fill in the real verseId
    if (s.verseId === null && knownVerseNumToId.has(s.verseNum)) {
      return { ...s, verseId: knownVerseNumToId.get(s.verseNum)! }
    }
    return s
  })

  return NextResponse.json({ suggestions: enriched })
}
