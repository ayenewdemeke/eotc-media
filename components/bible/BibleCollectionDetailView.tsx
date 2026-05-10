"use client"

import Link from "next/link"
import { BookMarked, ChevronLeft, ExternalLink } from "lucide-react"
import { BlBook, BibleLanguage, BibleVersion } from "@/types/models/bible"
import BookSidebar from "./BookSidebar"
import { useLocale } from "@/lib/i18n/LocaleContext"

export type CollectionVerse = {
  verseId: number
  bookId: number
  bookEnglishName: string
  bookAmharicName: string | null
  chapter: number
  verseNum: number
  text: string
}

interface Props {
  books: BlBook[]
  collection: {
    id: number
    name: string
    verses: CollectionVerse[]
  }
}

function localeToVersion(locale: string): { language: BibleLanguage; version: BibleVersion } {
  return locale === "am"
    ? { language: "amharic", version: "1954" }
    : { language: "english", version: "kjv" }
}

export default function BibleCollectionDetailView({ books, collection }: Props) {
  const { t, locale } = useLocale()
  const { language, version } = localeToVersion(locale)

  // Group verses by book+chapter; locale determines which book name to display
  const groups: { key: string; bookName: string; bookId: number; chapter: number; verses: CollectionVerse[] }[] = []
  const seen = new Map<string, number>()
  for (const v of collection.verses) {
    const bookName = locale === "am"
      ? (v.bookAmharicName ?? v.bookEnglishName)
      : (v.bookEnglishName ?? v.bookAmharicName ?? "")
    const key = `${v.bookId}::${v.chapter}`
    if (!seen.has(key)) {
      seen.set(key, groups.length)
      groups.push({ key, bookName, bookId: v.bookId, chapter: v.chapter, verses: [] })
    }
    groups[seen.get(key)!].verses.push(v)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr_256px]">

        {/* Left: book navigation sidebar */}
        <aside className="hidden lg:flex lg:flex-col border-r border-slate-100 sticky top-16 self-start h-[calc(100vh-4rem)] z-10">
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
            {books[0] && (
              <BookSidebar books={books} currentBook={books[0]} language={language} version={version} />
            )}
          </div>
        </aside>

        {/* Center: collection detail */}
        <main className="px-6 sm:px-10 py-8 sm:py-10 pb-32 lg:pb-16">
          <Link
            href="/bible/collections"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("bible_my_collections")}
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{collection.name}</h1>
              <p className="text-sm text-slate-400">
                {collection.verses.length}{" "}
                {collection.verses.length !== 1 ? t("col_verse_pl") : t("col_verse_sg")}
              </p>
            </div>
          </div>

          {collection.verses.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-sm">{t("col_no_verses_yet")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map(({ key, bookName, bookId, chapter, verses }) => (
                <div key={key} className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-700">
                      {bookName} {chapter}
                    </p>
                    <Link
                      href={`/bible/${language}/${version}/${bookId}/${chapter}`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t("col_open")} <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {verses.map(v => (
                      <li key={v.verseId} className="px-5 py-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-blue-400 pt-0.5 shrink-0 w-5 text-right">
                            {v.verseNum}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed font-serif">
                            {v.text || <span className="text-slate-400 italic">[no text]</span>}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right: empty panel to hold the 3-column shape */}
        <aside className="hidden lg:block border-l border-slate-100 sticky top-16 self-start h-[calc(100vh-4rem)]" />
      </div>
    </div>
  )
}
