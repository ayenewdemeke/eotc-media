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
  BookMarked,
  MousePointerClick,
  SlidersHorizontal,
  Copy,
  AlignJustify,
  List,
} from "lucide-react"
import { toast } from "sonner"
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
import VerseList, { VerseViewMode } from "./VerseList"
import HighlightPopover from "./HighlightPopover"
import BibleSearchSheet from "./BibleSearchSheet"
import CollectionDialog from "./CollectionDialog"

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
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)
  const [fontSizeIdx, setFontSizeIdx] = useState(1)
  const [isChapterNavOpen, setIsChapterNavOpen] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<number>>(new Set())
  const [selectedVerseNums, setSelectedVerseNums] = useState<number[]>([])
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<VerseViewMode>("paragraph")

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

  function closeSelectMode() {
    setSelectMode(false)
    setSelectedVerseIds(new Set())
    setSelectedVerseNums([])
  }

  function handleVerseClick(verseNum: number, verseId: number, el: HTMLElement) {
    if (selectMode) {
      setSelectedVerseIds(prev => {
        const next = new Set(prev)
        next.has(verseId) ? next.delete(verseId) : next.add(verseId)
        return next
      })
      setSelectedVerseNums(prev =>
        prev.includes(verseNum)
          ? prev.filter(n => n !== verseNum)
          : [...prev, verseNum].sort((a, b) => a - b)
      )
      return
    }
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

  // Copy single active verse
  function copySingleVerse() {
    const activeVerseText = verses.find(v => v.verse === activeVerse)?.text ?? null
    if (!activeVerse || !activeVerseText) return
    const ref = `${currentBookName} ${currentChapter}:${activeVerse}`
    navigator.clipboard.writeText(`${activeVerseText} — ${ref}`)
    toast.success("Verse copied")
  }

  // Copy all currently selected verses
  function copySelectedVerses() {
    const lines = verses
      .filter(v => selectedVerseIds.has(v.id))
      .sort((a, b) => a.verse - b.verse)
      .map(v => `${currentBookName} ${currentChapter}:${v.verse}  ${v.text}`)
      .join("\n")
    if (!lines) return
    navigator.clipboard.writeText(lines)
    toast.success(`${selectedVerseIds.size} verse${selectedVerseIds.size !== 1 ? "s" : ""} copied`)
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

  // Right panel content — shared between desktop sidebar and mobile sheet
  const panelContent = (
    <div className="space-y-4">
      {/* Collections */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
          My collections
        </p>
        {user ? (
          <div className="space-y-2">
            <button
              onClick={() => {
                if (selectMode) {
                  closeSelectMode()
                } else {
                  setSelectMode(true)
                  setIsMobilePanelOpen(false)
                }
              }}
              className={`w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all ${
                selectMode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              {selectMode ? "Selecting…" : "Select Verses"}
            </button>
            {selectMode && selectedVerseIds.size > 0 && (
              <>
                <button
                  onClick={() => { setIsCollectionDialogOpen(true); setIsMobilePanelOpen(false) }}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  Save {selectedVerseIds.size} verse{selectedVerseIds.size !== 1 ? "s" : ""}
                </button>
                <button
                  onClick={() => { copySelectedVerses(); setIsMobilePanelOpen(false) }}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy {selectedVerseIds.size} verse{selectedVerseIds.size !== 1 ? "s" : ""}
                </button>
              </>
            )}
            <a
              href="/bible/collections"
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200 bg-white transition-all"
            >
              View my collections
            </a>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            <a href="/auth/login" className="underline underline-offset-2 hover:text-slate-600">Sign in</a> to save verses to collections.
          </p>
        )}
      </div>

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
            <button
              onClick={copySingleVerse}
              className="mt-3 w-full flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-medium text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 transition-all"
            >
              <Copy className="w-3 h-3" />
              Copy verse
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            Tap a verse number to see it here.
          </p>
        )}
      </div>

      {/* Text size + view mode */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
          Reading
        </p>
        {/* Font size */}
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Text Size</p>
        <div className="flex items-center gap-1.5 mb-4">
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
        {/* View mode */}
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">View</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode("paragraph")}
            title="Paragraph view"
            className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "paragraph"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
            Paragraph
          </button>
          <button
            onClick={() => setViewMode("line")}
            title="One verse per line"
            className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "line"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            By verse
          </button>
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
      <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr_256px]">

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
            selectMode={selectMode}
            selectedVerseIds={selectedVerseIds}
            viewMode={viewMode}
            onVerseClick={handleVerseClick}
          />

          {/* Prev / Next */}
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

        {/* ── Right: controls + verse panel (desktop only) ── */}
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
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
            {panelContent}
          </div>
        </aside>
      </div>

      {/* Selection floating bar — appears above mobile bottom bar in select mode */}
      {selectMode && (
        <div className="fixed bottom-16 inset-x-0 lg:hidden z-20 px-4 pb-2">
          <div className="bg-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
            <span className="text-sm font-semibold">
              {selectedVerseIds.size > 0
                ? `${selectedVerseIds.size} verse${selectedVerseIds.size !== 1 ? "s" : ""} selected`
                : "Tap verses to select"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={closeSelectMode}
                className="text-blue-200 hover:text-white text-xs font-medium px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cancel
              </button>
              {selectedVerseIds.size > 0 && (
                <>
                  <button
                    onClick={copySelectedVerses}
                    className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button
                    onClick={() => setIsCollectionDialogOpen(true)}
                    className="bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

        {/* Controls panel button (replaces Search — search is in the top bar) */}
        <button
          onClick={() => setIsMobilePanelOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Panel
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOOK DRAWER
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
          MOBILE CONTROLS PANEL
      ═══════════════════════════════════════════════════ */}
      <Sheet open={isMobilePanelOpen} onOpenChange={setIsMobilePanelOpen}>
        <SheetContent
          side="right"
          className="w-80 p-0 flex flex-col"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <SheetTitle className="sr-only">Reading Controls</SheetTitle>
          <div className="flex-shrink-0 px-5 py-4 border-b border-slate-100">
            <Select
              value={`${language}__${version}`}
              onValueChange={value => {
                const [l, v] = value.split("__")
                router.push(`/bible/${l}/${v}/${currentBook.id}/${currentChapter}`)
                setIsMobilePanelOpen(false)
              }}
            >
              <SelectTrigger className="w-full h-8 text-xs bg-slate-100 border-0 text-slate-700 focus:ring-0 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amharic__1954">Amharic 1954</SelectItem>
                <SelectItem value="english__kjv">English KJV</SelectItem>
                <SelectItem value="oromifa__v1">Oromifa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {panelContent}
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══════════════════════════════════════════════════
          COLLECTION DIALOG, HIGHLIGHT POPOVER & SEARCH SHEET
      ═══════════════════════════════════════════════════ */}
      <CollectionDialog
        open={isCollectionDialogOpen}
        selectedVerseIds={[...selectedVerseIds]}
        selectedVerseNums={selectedVerseNums}
        bookName={currentBookName}
        chapter={currentChapter}
        onClose={() => {
          setIsCollectionDialogOpen(false)
          closeSelectMode()
        }}
      />

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
