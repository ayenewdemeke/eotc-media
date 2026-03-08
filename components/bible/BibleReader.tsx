"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { BlBook, BlVerse, BibleLanguage, BibleVersion } from "@/types/models/bible"
import BookSidebar from "./BookSidebar"
import VerseList from "./VerseList"
import HighlightPopover from "./HighlightPopover"
import BibleSearchSheet from "./BibleSearchSheet"

interface BibleReaderProps {
  currentBook: BlBook
  currentChapter: number
  currentBookName: string
  books: BlBook[]
  language: BibleLanguage
  version: BibleVersion
  verses: BlVerse[]
  chapterNumbers: number[]
  dir: "ltr" | "rtl"
  selectedVerse?: string
  user: { name?: string | null; id?: string } | null
}

const FONT_SIZES = [15, 17, 20] as const

export default function BibleReader({
  currentBook,
  currentChapter,
  currentBookName,
  books,
  language,
  version,
  verses,
  chapterNumbers,
  dir,
  selectedVerse,
  user,
}: BibleReaderProps) {
  const router = useRouter()

  const parsed = selectedVerse ? parseInt(selectedVerse, 10) : null
  const initialVerse = parsed && !isNaN(parsed) ? parsed : null

  const [activeVerse, setActiveVerse] = useState<number | null>(initialVerse)
  const [highlightVerseNum, setHighlightVerseNum] = useState<number | null>(null)
  const [highlightPos, setHighlightPos] = useState<{ top: number; left: number } | null>(null)
  const [currentHighlightColor, setCurrentHighlightColor] = useState<string | null>(null)
  const [localHighlights, setLocalHighlights] = useState<Map<number, string>>(
    () => new Map(verses.filter(v => v.highlight).map(v => [v.id, v.highlight!]))
  )
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [fontSizeIdx, setFontSizeIdx] = useState(1)
  const [isChapterNavOpen, setIsChapterNavOpen] = useState(false)

  // Separate refs for mobile and desktop chapter nav (both may be in DOM simultaneously)
  const mobileChapterNavRef = useRef<HTMLDivElement>(null)
  const desktopChapterNavRef = useRef<HTMLDivElement>(null)

  // Scroll to selected verse on load
  useEffect(() => {
    if (!initialVerse) return
    setTimeout(() => {
      document.getElementById(`verse-${initialVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)
  }, [initialVerse])

  // Arrow key chapter navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "ArrowLeft" && currentChapter > 1)
        router.push(`/bible/${language}/${version}/${currentBook.id}/${currentChapter - 1}`)
      if (e.key === "ArrowRight" && currentChapter < chapterNumbers.length)
        router.push(`/bible/${language}/${version}/${currentBook.id}/${currentChapter + 1}`)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [currentChapter, chapterNumbers.length, language, version, currentBook.id, router])

  // Close chapter popover on click outside (checks both mobile + desktop refs)
  useEffect(() => {
    if (!isChapterNavOpen) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        mobileChapterNavRef.current?.contains(target) ||
        desktopChapterNavRef.current?.contains(target)
      ) return
      setIsChapterNavOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [isChapterNavOpen])

  function handleVerseClick(verseNum: number, verseId: number, el: HTMLElement) {
    setActiveVerse(prev => prev === verseNum ? null : verseNum)
    if (!user) return
    const rect = el.getBoundingClientRect()
    const top = Math.min(rect.bottom + 6, window.innerHeight - 120)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - 220))
    setHighlightVerseNum(verseNum)
    setHighlightPos({ top, left })
    setCurrentHighlightColor(localHighlights.get(verseId) ?? null)
  }

  function closeHighlight() {
    setHighlightVerseNum(null)
    setHighlightPos(null)
  }

  async function handleHighlight(color: string) {
    if (highlightVerseNum === null) return
    const verse = verses.find(v => v.verse === highlightVerseNum)
    if (!verse) return
    const prev = localHighlights.get(verse.id)
    setLocalHighlights(m => {
      const next = new Map(m)
      if (color) next.set(verse.id, color)
      else next.delete(verse.id)
      return next
    })
    closeHighlight()
    try {
      await fetch("/api/bible/highlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: currentBook.id, chapter: currentChapter, verse: highlightVerseNum, color }),
      })
    } catch {
      setLocalHighlights(m => {
        const next = new Map(m)
        if (prev) next.set(verse.id, prev)
        else next.delete(verse.id)
        return next
      })
    }
  }

  const fontSize = FONT_SIZES[fontSizeIdx]
  const activeVerseText = verses.find(v => v.verse === activeVerse)?.text ?? null

  // Chapter grid — shared between mobile and desktop popovers
  const chapterGrid = (
    <div className="grid grid-cols-7 gap-1 max-h-[55vh] overflow-y-auto">
      {chapterNumbers.map(ch => (
        <Link
          key={ch}
          href={`/bible/${language}/${version}/${currentBook.id}/${ch}`}
          onClick={() => setIsChapterNavOpen(false)}
          className={`flex items-center justify-center h-8 rounded-lg text-xs font-semibold transition-all ${
            ch === currentChapter
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {ch}
        </Link>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════
          MOBILE-ONLY top bar (hidden on lg+)
      ═══════════════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 lg:hidden bg-white/95 backdrop-blur-sm border-b border-slate-100/80">
        <div className="px-4 h-11 flex items-center justify-between gap-3">
          {/* Breadcrumb with chapter selector */}
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <span className="text-slate-600 font-medium truncate max-w-[120px]">{currentBookName}</span>
            <span className="text-slate-300 select-none">/</span>
            {/* Mobile chapter selector */}
            <div ref={mobileChapterNavRef} className="relative shrink-0">
              <button
                onClick={() => setIsChapterNavOpen(v => !v)}
                className="flex items-center gap-1 text-slate-800 font-semibold hover:text-blue-600 transition-colors"
              >
                {currentChapter}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isChapterNavOpen ? "rotate-180" : ""}`} />
              </button>
              {isChapterNavOpen && (
                // Fixed position keeps the popover within the viewport on all screen sizes
                <div className="fixed inset-x-4 z-[200] bg-white rounded-2xl shadow-xl border border-slate-100 p-3" style={{ top: "7.25rem" }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">
                    {currentBookName}
                  </p>
                  {chapterGrid}
                </div>
              )}
            </div>
          </nav>
          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center w-8 h-8 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <Select
              value={`${language}__${version}`}
              onValueChange={value => {
                const [l, v] = value.split("__")
                router.push(`/bible/${l}/${v}/${currentBook.id}/${currentChapter}`)
              }}
            >
              <SelectTrigger className="h-8 text-xs w-[116px] bg-slate-100 border-0 text-slate-700 hover:bg-slate-200 focus:ring-0 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amharic__1954">Amharic 1954</SelectItem>
                <SelectItem value="english__kjv">English KJV</SelectItem>
                <SelectItem value="oromifa__v1">Oromifa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          THREE-COLUMN BODY
      ═══════════════════════════════════════════════════ */}
      <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr_256px]">

        {/* ── Left: book navigation ─────────────────────────
            z-10 ensures the chapter popover floats above the
            center column (which follows later in DOM order)
        ──────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex lg:flex-col border-r border-slate-100 sticky top-16 self-start h-[calc(100vh-4rem)] z-10">
          {/* Left column header: book + chapter selector */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100">
            <nav className="flex items-center gap-1 text-sm flex-wrap">
              <Link
                href={`/bible/${language}/${version}/${currentBook.id}/1`}
                className="text-slate-500 font-medium hover:text-slate-700 transition-colors truncate max-w-[120px]"
              >
                {currentBookName}
              </Link>
              <span className="text-slate-300 select-none mx-0.5">/</span>
              {/* Desktop chapter selector */}
              <div ref={desktopChapterNavRef} className="relative">
                <button
                  onClick={() => setIsChapterNavOpen(v => !v)}
                  className="flex items-center gap-1 text-slate-800 font-semibold hover:text-blue-600 transition-colors"
                >
                  {currentChapter}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isChapterNavOpen ? "rotate-180" : ""}`} />
                </button>
                {isChapterNavOpen && (
                  <div className="absolute top-full left-0 mt-2 z-[200] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-3 w-[272px]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">
                      {currentBookName}
                    </p>
                    {chapterGrid}
                  </div>
                )}
              </div>
            </nav>
          </div>
          {/* Book list */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 py-3"
            style={{ scrollbarWidth: "none" }}
          >
            <BookSidebar
              books={books}
              currentBook={currentBook}
              language={language}
              version={version}
            />
          </div>
        </aside>

        {/* ── Center: reading area ────────────────────────── */}
        <main className="px-6 sm:px-10 py-8 sm:py-10 pb-28 lg:pb-16">
          {/* Chapter heading */}
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1.5">
              {currentBookName}
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-[26px] font-bold text-slate-900 leading-none">
                {currentChapter}
              </h1>
              <span className="text-sm text-slate-400 font-medium">of {chapterNumbers.length}</span>
              <span className="text-xs text-slate-300 ml-0.5">· {verses.length} verses</span>
            </div>
          </div>

          <VerseList
            verses={verses}
            dir={dir}
            activeVerse={activeVerse}
            user={user}
            localHighlights={localHighlights}
            fontSize={fontSize}
            onVerseClick={handleVerseClick}
          />

          {/* Prev / Next — language-neutral */}
          <div className="flex items-center justify-between mt-14 pt-6 border-t border-slate-100">
            {currentChapter > 1 ? (
              <Link
                href={`/bible/${language}/${version}/${currentBook.id}/${currentChapter - 1}`}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                {currentChapter - 1}
              </Link>
            ) : <div />}

            <span className="text-xs text-slate-400 font-medium">
              {currentBookName} · {currentChapter} / {chapterNumbers.length}
            </span>

            {currentChapter < chapterNumbers.length ? (
              <Link
                href={`/bible/${language}/${version}/${currentBook.id}/${currentChapter + 1}`}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
              >
                {currentChapter + 1}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </main>

        {/* ── Right: controls + verse panel ──────────────── */}
        <aside className="hidden lg:flex lg:flex-col border-l border-slate-100 sticky top-16 self-start h-[calc(100vh-4rem)]">
          {/* Right column header: translation + search */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Select
                value={`${language}__${version}`}
                onValueChange={value => {
                  const [l, v] = value.split("__")
                  router.push(`/bible/${l}/${v}/${currentBook.id}/${currentChapter}`)
                }}
              >
                <SelectTrigger className="flex-1 h-8 text-xs bg-slate-100 border-0 text-slate-700 hover:bg-slate-200 focus:ring-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amharic__1954">Amharic 1954</SelectItem>
                  <SelectItem value="english__kjv">English KJV</SelectItem>
                  <SelectItem value="oromifa__v1">Oromifa</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-8 h-8 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                title="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right column content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4">
            {/* Selected verse */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                Selected Verse
              </p>
              {activeVerse && activeVerseText ? (
                <div>
                  <p className="text-xs font-bold text-blue-600 mb-2">
                    {currentBookName} {currentChapter}:{activeVerse}
                  </p>
                  <p className="text-[13px] text-slate-700 leading-relaxed font-serif">
                    {activeVerseText.length > 160
                      ? activeVerseText.slice(0, 157) + "…"
                      : activeVerseText}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tap a verse number to see it here.
                </p>
              )}
            </div>

            {/* Text size */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                Text Size
              </p>
              <div className="flex items-center gap-1.5">
                {(["S", "M", "L"] as const).map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setFontSizeIdx(i)}
                    className={`flex-1 flex items-center justify-center h-8 rounded-lg text-xs font-bold transition-all ${
                      fontSizeIdx === i
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Commentary placeholder */}
            <div className="rounded-xl border border-dashed border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1.5">
                Commentary
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verse commentary coming soon.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOTTOM BAR
      ═══════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 bg-white/96 backdrop-blur-sm border-t border-slate-200 px-5 py-3 flex items-center justify-between lg:hidden z-30">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Books
        </button>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
          {currentChapter > 1 ? (
            <Link
              href={`/bible/${language}/${version}/${currentBook.id}/${currentChapter - 1}`}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentChapter - 1}
            </Link>
          ) : <span className="w-9" />}

          <span className="text-xs text-slate-400 font-medium min-w-[4rem] text-center">
            {currentChapter} / {chapterNumbers.length}
          </span>

          {currentChapter < chapterNumbers.length ? (
            <Link
              href={`/bible/${language}/${version}/${currentBook.id}/${currentChapter + 1}`}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              {currentChapter + 1}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : <span className="w-9" />}
        </div>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOOK DRAWER
          onOpenAutoFocus: prevent keyboard from appearing
          when the drawer opens (user taps the search input
          explicitly if they want to search)
      ═══════════════════════════════════════════════════ */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0"
          showCloseButton={false}
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <SheetTitle className="sr-only">Book Navigation</SheetTitle>
          <div className="p-4 h-full overflow-hidden flex flex-col">
            <BookSidebar
              books={books}
              currentBook={currentBook}
              language={language}
              version={version}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══════════════════════════════════════════════════
          HIGHLIGHT POPOVER & SEARCH SHEET
      ═══════════════════════════════════════════════════ */}
      <HighlightPopover
        verseNum={highlightVerseNum}
        position={highlightPos}
        currentColor={currentHighlightColor}
        onHighlight={handleHighlight}
        onClose={closeHighlight}
      />

      <BibleSearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        language={language}
        version={version}
        currentBookId={currentBook.id}
      />
    </div>
  )
}
