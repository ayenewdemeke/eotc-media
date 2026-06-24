"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { BlBook, BibleLanguage, BibleVersion } from "@/types/models/bible"
import { BIBLE_SECTIONS, OSIS_TO_SECTION } from "@/lib/bible-sections"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface BookSidebarProps {
  books: BlBook[]
  currentBook: BlBook
  language: BibleLanguage
  version: BibleVersion
}

function getBookName(book: BlBook, language: BibleLanguage): string {
  if (language === "amharic") return book.amharicName ?? book.englishName
  if (language === "oromifa") return book.oromifaName ?? book.englishName
  return book.englishName
}

const SCROLL_KEY = "bibleBookListScroll"

export default function BookSidebar({ books, currentBook, language, version }: BookSidebarProps) {
  const [query, setQuery] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const { t } = useLocale()

  // Restore scroll position from the previous navigation
  useEffect(() => {
    if (!listRef.current) return
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (saved) {
      listRef.current.scrollTop = parseInt(saved, 10)
    }
  }, [])

  function handleScroll() {
    if (listRef.current) {
      sessionStorage.setItem(SCROLL_KEY, String(listRef.current.scrollTop))
    }
  }

  const filtered = query.trim()
    ? books.filter(b => getBookName(b, language).toLowerCase().includes(query.toLowerCase()))
    : books

  // Group by section
  const sectionMap: Record<string, BlBook[]> = {}
  const otherBooks: BlBook[] = []
  for (const book of filtered) {
    const section = OSIS_TO_SECTION[book.osisCode]
    if (section) {
      if (!sectionMap[section]) sectionMap[section] = []
      sectionMap[section].push(book)
    } else {
      otherBooks.push(book)
    }
  }

  const orderedSections = BIBLE_SECTIONS
    .map(s => ({
      name: language === "amharic" ? s.nameAmharic : s.name,
      books: sectionMap[s.name] ?? [],
    }))
    .filter(s => s.books.length > 0)
  const otherLabel = language === "amharic" ? "ሌሎች መጻሕፍት" : "Other Books"
  if (otherBooks.length > 0) orderedSections.push({ name: otherLabel, books: otherBooks })

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t("bible_find_book")}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-100/70 border border-transparent rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/15 transition-all"
        />
      </div>

      {/* Book list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {orderedSections.length === 0 ? (
          <p className="text-xs text-slate-400 text-center mt-8">{t("bible_no_books")}</p>
        ) : (
          orderedSections.map(section => (
            <div key={section.name} className="mb-2">
              {/* Section header */}
              <div className="flex items-center gap-2 px-2 pt-3 pb-1.5 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {section.name}
                </span>
                <span className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-medium text-slate-300 tabular-nums">
                  {section.books.length}
                </span>
              </div>
              {/* Books */}
              <div className="space-y-0.5">
                {section.books.map(book => {
                  const isActive = book.id === currentBook.id
                  return (
                    <Link
                      key={book.id}
                      href={`/bible/${language}/${version}/${book.id}/1`}
                      className={`group relative flex items-center gap-2.5 pl-3.5 pr-3 py-2 rounded-lg text-sm transition-all duration-100 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      {/* Active accent bar */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-blue-500 transition-all ${
                          isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                        }`}
                      />
                      <span className="truncate">{getBookName(book, language)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
