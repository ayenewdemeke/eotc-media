"use client"

import Link from "next/link"
import { BookMarked, ChevronRight } from "lucide-react"
import { BlBook, BlCollection, BibleLanguage, BibleVersion } from "@/types/models/bible"
import BookSidebar from "./BookSidebar"
import { useLocale } from "@/lib/i18n/LocaleContext"

function localeToVersion(locale: string): { language: BibleLanguage; version: BibleVersion } {
  return locale === "am"
    ? { language: "amharic", version: "1954" }
    : { language: "english", version: "kjv" }
}

interface Props {
  books: BlBook[]
  collections: BlCollection[]
}

export default function BibleCollectionsView({ books, collections }: Props) {
  const { t, locale } = useLocale()
  const { language, version } = localeToVersion(locale)

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

        {/* Center: collections content */}
        <main className="px-6 sm:px-10 py-8 sm:py-10 pb-32 lg:pb-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <BookMarked className="w-5 h-5 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">{t("bible_my_collections")}</h1>
            </div>
            <p className="text-sm text-slate-500">{t("col_subtitle")}</p>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
              <BookMarked className="w-10 h-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
              <p className="font-semibold text-slate-500">{t("col_empty_state")}</p>
              <p className="text-sm text-slate-400 mt-1">{t("col_empty_page_hint")}</p>
              <Link
                href="/bible"
                className="inline-block mt-5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("col_go_bible")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {collections.map(col => (
                <Link
                  key={col.id}
                  href={`/bible/collections/${col.id}`}
                  prefetch={false}
                  className="group flex items-center gap-4 p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookMarked className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {col.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {col._count?.verses ?? 0}{" "}
                      {(col._count?.verses ?? 0) !== 1 ? t("col_verse_pl") : t("col_verse_sg")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                </Link>
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
