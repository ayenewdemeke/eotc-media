import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { getBooks, getBook, getChapterVerses } from "@/lib/api/bible"
import { BibleLanguage, BibleVersion } from "@/types/models/bible"
import Navbar from "@/components/Navbar"
import BibleReader from "@/components/bible/BibleReader"

interface PageProps {
  params: Promise<{
    language: BibleLanguage
    version: BibleVersion
    book: string
    chapter: string
  }>
  searchParams: Promise<{
    verse?: string
  }>
}

function getBookDisplayName(
  book: NonNullable<Awaited<ReturnType<typeof getBook>>>,
  language: BibleLanguage
): string {
  if (language === "amharic") return book.amharicName ?? book.englishName
  if (language === "oromifa") return book.oromifaName ?? book.englishName
  return book.englishName
}

const LANGUAGE_LABELS: Record<string, { en: string; am: string }> = {
  amharic: { en: "Amharic", am: "በአማርኛ" },
  oromifa: { en: "Afaan Oromo", am: "በኦሮምኛ" },
  tigrigna: { en: "Tigrigna", am: "በትግርኛ" },
  english: { en: "English", am: "በእንግሊዝኛ" },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { language, version, book, chapter } = await params
  const bookId = parseInt(book)
  const chapterNum = parseInt(chapter)
  if (isNaN(bookId) || isNaN(chapterNum)) return {}
  const currentBook = await getBook(bookId)
  if (!currentBook) return {}
  const bookName = getBookDisplayName(currentBook, language)
  const langLabel = LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS.english
  const amharicName = currentBook.amharicName ?? currentBook.englishName
  const title = `${bookName} ${chapterNum} — ${langLabel.en} Bible | መጽሐፍ ቅዱስ`
  const description =
    `Read ${currentBook.englishName} chapter ${chapterNum} in the ${langLabel.en} Bible with voice search on EOTC Media. ` +
    `${amharicName} ምዕራፍ ${chapterNum} — መጽሐፍ ቅዱስ ${langLabel.am} በድምጽ ፍለጋ ያንብቡ።`
  return {
    title,
    description,
    keywords: [
      `${currentBook.englishName} ${chapterNum}`,
      `${langLabel.en} Bible`,
      "Bible voice search",
      "መጽሐፍ ቅዱስ",
      `${amharicName} ${chapterNum}`,
      "መጽሐፍ ቅዱስ በድምጽ ፍለጋ",
    ],
    alternates: { canonical: `/bible/${language}/${version}/${bookId}/${chapterNum}` },
    openGraph: {
      title,
      description,
      url: `/bible/${language}/${version}/${bookId}/${chapterNum}`,
      type: "article",
    },
  }
}

export default async function BibleChapterPage({ params, searchParams }: PageProps) {
  const session = await auth()
  const { language, version, book, chapter } = await params
  const { verse: selectedVerse = "" } = await searchParams

  const bookId = parseInt(book)
  const chapterNum = parseInt(chapter)

  if (isNaN(bookId) || isNaN(chapterNum)) notFound()

  const [{ books }, currentBook] = await Promise.all([
    getBooks(),
    getBook(bookId),
  ])

  if (!currentBook) notFound()

  const { verses, chapterNumbers } = await getChapterVerses(
    language,
    version,
    bookId,
    chapterNum,
    session?.user?.id ? parseInt(session.user.id) : undefined
  )

  const currentBookName = getBookDisplayName(currentBook, language)
  const dir = "ltr"

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* pt-16 accounts for the fixed Navbar (h-16) */}
      <div className="pt-16">
        <BibleReader
          currentBook={currentBook}
          currentChapter={chapterNum}
          currentBookName={currentBookName}
          books={books}
          language={language}
          version={version}
          verses={verses}
          chapterNumbers={chapterNumbers}
          dir={dir}
          selectedVerse={selectedVerse}
          user={session?.user || null}
        />
      </div>
    </div>
  )
}
