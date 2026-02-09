import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getBooks, getBook, getChapterVerses } from "@/lib/api/bible"
import { BibleLanguage, BibleVersion } from "@/types/models/bible"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import BibleReader from "@/components/bible/BibleReader"

interface PageProps {
  params: {
    language: BibleLanguage
    version: BibleVersion
    book: string
    chapter: string
  }
  searchParams: {
    verse?: string
  }
}

export default async function BibleChapterPage({ params, searchParams }: PageProps) {
  const session = await auth()
  const { language, version, book, chapter } = await params
  const awaitedSearchParams = await searchParams
  const selectedVerse = awaitedSearchParams.verse || ''

  const bookId = parseInt(book)
  const chapterNum = parseInt(chapter)

  if (isNaN(bookId) || isNaN(chapterNum)) {
    notFound()
  }

  const { books } = await getBooks();
  const currentBook = await getBook(bookId);
  if (!currentBook) {
    notFound();
  }
  const { verses, chapterNumbers } = await getChapterVerses(
    language,
    version,
    bookId,
    chapterNum,
    session?.user?.id ? parseInt(session.user.id) : undefined
  );
  // Determine book name based on language
  let currentBookName = currentBook.englishName;
  if (language === 'amharic') currentBookName = currentBook.amharicName;
  else if (language === 'oromifa') currentBookName = currentBook.oromifaName;
  // Determine text direction
  const dir = (language === 'hebrew-greek' && bookId < 40) ? 'rtl' : 'ltr';
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
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
      </main>
      <Footer />
    </div>
  );
}
