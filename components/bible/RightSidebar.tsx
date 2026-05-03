"use client"

import { useState } from "react"
import { Copy, Bookmark, Type, CheckCheck } from "lucide-react"
import { toast } from "sonner"
import { BibleLanguage, BibleVersion, BlBook } from "@/types/models/bible"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface RightSidebarProps {
  activeVerse: number | null
  activeVerseText: string
  currentBook: BlBook
  currentChapter: number
  language: BibleLanguage
  version: BibleVersion
  user: { name?: string | null } | null
  localHighlights: Map<number, string>
  verses: Array<{ id: number; verse: number }>
  fontSize: "base" | "lg" | "xl"
  onFontSizeChange: (size: "base" | "lg" | "xl") => void
  onJumpToVerse: (verseNum: number) => void
}

type Tab = "verse" | "highlights" | "reading"

function getBookName(book: BlBook, language: BibleLanguage): string {
  if (language === "amharic") return book.amharicName ?? book.englishName
  if (language === "oromifa") return book.oromifaName ?? book.englishName
  return book.englishName
}

export default function RightSidebar({
  activeVerse,
  activeVerseText,
  currentBook,
  currentChapter,
  language,
  user,
  localHighlights,
  verses,
  fontSize,
  onFontSizeChange,
  onJumpToVerse,
}: RightSidebarProps) {
  const [tab, setTab] = useState<Tab>("verse")
  const bookName = getBookName(currentBook, language)
  const { t } = useLocale()

  const reference = activeVerse
    ? `${bookName} ${currentChapter}:${activeVerse}`
    : null

  function copyText() {
    if (!activeVerseText || !reference) return
    navigator.clipboard.writeText(`${activeVerseText} — ${reference}`)
    toast.success("Copied to clipboard")
  }

  function copyReference() {
    if (!reference) return
    navigator.clipboard.writeText(reference)
    toast.success("Reference copied")
  }

  // Highlights for current chapter
  const chapterHighlights = verses
    .map(v => {
      const color = localHighlights.get(v.id)
      return color ? { verseNum: v.verse, color } : null
    })
    .filter(Boolean) as Array<{ verseNum: number; color: string }>

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "verse",      label: t("bible_tab_verse"),      icon: <CheckCheck className="w-3.5 h-3.5" /> },
    { id: "highlights", label: t("bible_tab_highlights"), icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: "reading",    label: t("bible_tab_reading"),    icon: <Type className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="bg-slate-100 rounded-xl p-1 flex gap-0.5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
              tab === t.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Verse tab */}
      {tab === "verse" && (
        <div className="space-y-3">
          {reference ? (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{reference}</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeVerseText || <span className="text-slate-400 italic">{t("bible_no_text")}</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyText}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t("bible_copy_verse")}
                </button>
                <button
                  onClick={copyReference}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t("bible_copy_ref")}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{t("bible_no_verse")}</p>
              <p className="text-xs mt-1 opacity-70">{t("bible_click_to_select")}</p>
            </div>
          )}
        </div>
      )}

      {/* Highlights tab */}
      {tab === "highlights" && (
        <div>
          {!user ? (
            <div className="text-center py-8 text-slate-400">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{t("bible_signin_highlights")}</p>
              <p className="text-xs mt-1 opacity-70">{t("bible_highlights_saved")}</p>
            </div>
          ) : chapterHighlights.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{t("bible_no_highlights")}</p>
              <p className="text-xs mt-1 opacity-70">{t("bible_click_to_highlight")}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {chapterHighlights.length} {t("bible_highlighted")}
              </p>
              {chapterHighlights.map(h => (
                <button
                  key={h.verseNum}
                  onClick={() => onJumpToVerse(h.verseNum)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {bookName} {currentChapter}:{h.verseNum}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reading tab */}
      {tab === "reading" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("bible_font_size")}</p>
            <div className="flex gap-2">
              {(["base", "lg", "xl"] as const).map((size, i) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-xl font-semibold border-2 transition-all ${
                    fontSize === size
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  style={{ fontSize: i === 0 ? "13px" : i === 1 ? "16px" : "19px" }}
                >
                  A
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              {t("bible_tip")}{user ? "" : t("bible_signin_save")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
