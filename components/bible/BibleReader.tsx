"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookMarked,
  SlidersHorizontal,
  Copy,
  Check,
  AlignJustify,
  List,
  X,
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
import BibleSearchSheet from "./BibleSearchSheet"
import CollectionDialog from "./CollectionDialog"

// ── Highlight colours ─────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green",  value: "#bbf7d0" },
  { name: "Blue",   value: "#bfdbfe" },
  { name: "Red",    value: "#fecaca" },
  { name: "Cyan",   value: "#cffafe" },
]

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

const VERSION_LABELS: Record<string, string> = {
  kjv:  "KJV",
  "1954": "Am 1954",
  v1:   "Oromifa",
}

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

  // ── Reading preferences (persisted) ──────────────────────────────
  const [fontSizeIdx, setFontSizeIdx] = useState(1)
  const [viewMode, setViewMode] = useState<VerseViewMode>("line")

  useEffect(() => {
    const fs = localStorage.getItem("bible_font_size")
    if (fs !== null) {
      const idx = parseInt(fs, 10)
      if (idx >= 0 && idx <= 2) setFontSizeIdx(idx)
    }
    const vm = localStorage.getItem("bible_view_mode")
    if (vm === "paragraph" || vm === "line") setViewMode(vm)
  }, [])

  function changeFontSize(i: number) {
    setFontSizeIdx(i)
    localStorage.setItem("bible_font_size", String(i))
  }
  function changeViewMode(mode: VerseViewMode) {
    setViewMode(mode)
    localStorage.setItem("bible_view_mode", mode)
  }

  // ── Highlights ────────────────────────────────────────────────────
  const [localHighlights, setLocalHighlights] = useState<Map<number, string>>(
    () => new Map(verses.filter(v => v.highlight).map(v => [v.id, v.highlight!]))
  )

  // ── Verse selection ───────────────────────────────────────────────
  const [activeVerse, setActiveVerse] = useState<number | null>(initialVerse)
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<number>>(new Set())
  const [selectedVerseNums, setSelectedVerseNums] = useState<number[]>([])
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── UI state ──────────────────────────────────────────────────────
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)
  const [isChapterNavOpen, setIsChapterNavOpen] = useState(false)

  const mobileChapterNavRef = useRef<HTMLDivElement>(null)
  const mainChapterNavRef = useRef<HTMLDivElement>(null)
  const [isMainChapterOpen, setIsMainChapterOpen] = useState(false)

  // ── Stable clear-selection callback ──────────────────────────────
  const clearSelection = useCallback(() => {
    setSelectedVerseIds(new Set())
    setSelectedVerseNums([])
    setActiveVerse(null)
    setCopied(false)
  }, [])

  // ── Dismiss selection on click-outside or Escape ──────────────────
  useEffect(() => {
    if (selectedVerseIds.size === 0) return
    function onOutsideClick(e: MouseEvent) {
      // Keep selection if click is inside any designated zone
      if ((e.target as Element).closest?.("[data-selection-zone]")) return
      clearSelection()
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") clearSelection()
    }
    document.addEventListener("mousedown", onOutsideClick)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onOutsideClick)
      document.removeEventListener("keydown", onEscape)
    }
  }, [selectedVerseIds.size, clearSelection])

  // ── Derived highlight state ───────────────────────────────────────
  const selectedHighlightColors = useMemo(() => {
    const s = new Set<string>()
    for (const id of selectedVerseIds) {
      const c = localHighlights.get(id)
      if (c) s.add(c)
    }
    return s
  }, [selectedVerseIds, localHighlights])

  const uniformHighlightColor = selectedHighlightColors.size === 1
    ? [...selectedHighlightColors][0]
    : null
  const anyHighlighted = selectedHighlightColors.size > 0

  const activeVerseText = verses.find(v => v.verse === activeVerse)?.text ?? null

  // ── Scroll to initial verse ───────────────────────────────────────
  useEffect(() => {
    if (!initialVerse) return
    setTimeout(() => {
      document.getElementById(`verse-${initialVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)
  }, [initialVerse])

  // ── Arrow-key chapter navigation ──────────────────────────────────
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

  // ── Chapter popover (mobile top bar) — click outside ─────────────
  useEffect(() => {
    if (!isChapterNavOpen) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (mobileChapterNavRef.current?.contains(target)) return
      setIsChapterNavOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [isChapterNavOpen])

  // ── Main-heading chapter popover — click outside ──────────────────
  useEffect(() => {
    if (!isMainChapterOpen) return
    function onClickOutside(e: MouseEvent) {
      if (mainChapterNavRef.current?.contains(e.target as Node)) return
      setIsMainChapterOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [isMainChapterOpen])

  // ── Verse click (now receives arrays for grouped empty verses) ────
  function handleVerseClick(verseNums: number[], verseIds: number[]) {
    const primaryId = verseIds[verseIds.length - 1]
    const isCurrentlySelected = selectedVerseIds.has(primaryId)

    setSelectedVerseIds(prev => {
      const next = new Set(prev)
      for (const id of verseIds) {
        isCurrentlySelected ? next.delete(id) : next.add(id)
      }
      return next
    })
    setSelectedVerseNums(prev => {
      if (isCurrentlySelected) return prev.filter(n => !verseNums.includes(n))
      return [...new Set([...prev, ...verseNums])].sort((a, b) => a - b)
    })

    const primaryNum = verseNums[verseNums.length - 1]
    if (!isCurrentlySelected) {
      setActiveVerse(primaryNum)
    } else if (verseNums.includes(activeVerse ?? -1)) {
      const remaining = selectedVerseNums.filter(n => !verseNums.includes(n))
      setActiveVerse(remaining.length > 0 ? remaining[remaining.length - 1] : null)
    }

    // Reset "Copied" state when selection changes
    setCopied(false)
  }

  // ── Highlight all selected verses ─────────────────────────────────
  async function handleHighlightAll(color: string) {
    if (!user) return
    const selected = verses.filter(v => selectedVerseIds.has(v.id))
    if (selected.length === 0) return

    const prevHighlights = selected.map(v => ({ id: v.id, color: localHighlights.get(v.id) }))

    setLocalHighlights(m => {
      const next = new Map(m)
      for (const v of selected) {
        if (color) next.set(v.id, color)
        else next.delete(v.id)
      }
      return next
    })

    try {
      await Promise.all(selected.map(v =>
        fetch("/api/bible/highlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: currentBook.id, chapter: currentChapter, verse: v.verse, color }),
        })
      ))
      toast.success(color ? "Highlight applied" : "Highlight removed")
    } catch {
      setLocalHighlights(m => {
        const next = new Map(m)
        for (const { id, color: prev } of prevHighlights) {
          if (prev) next.set(id, prev)
          else next.delete(id)
        }
        return next
      })
    }
  }

  // ── Copy selected verses (standard citation format) ───────────────
  function copySelectedVerses() {
    const selected = verses
      .filter(v => selectedVerseIds.has(v.id) && v.text)
      .sort((a, b) => a.verse - b.verse)
    if (selected.length === 0) return

    const versionLabel = VERSION_LABELS[version] ?? version

    // Build the reference header: "Genesis 1:1", "Genesis 1:1–3", or "Genesis 1:1,3,5"
    let reference: string
    if (selected.length === 1) {
      reference = `${currentBookName} ${currentChapter}:${selected[0].verse}`
    } else {
      const isConsecutive = selected.every(
        (v, i) => i === 0 || v.verse === selected[i - 1].verse + 1
      )
      if (isConsecutive) {
        reference = `${currentBookName} ${currentChapter}:${selected[0].verse}–${selected[selected.length - 1].verse}`
      } else {
        reference = `${currentBookName} ${currentChapter}:${selected.map(v => v.verse).join(",")}`
      }
    }

    const header = `${reference} (${versionLabel})`
    const body = selected.map(v => `${v.verse} ${v.text}`).join("\n")
    navigator.clipboard.writeText(`${header}\n${body}`)
    setCopied(true)
    toast.success(`${selected.length} verse${selected.length !== 1 ? "s" : ""} copied`)
    setTimeout(() => setCopied(false), 2500)
  }

  const fontSize = FONT_SIZES[fontSizeIdx]

  // ── Chapter grid ──────────────────────────────────────────────────
  const chapterGrid = (
    <div className="grid grid-cols-7 gap-1 max-h-[55vh] overflow-y-auto">
      {chapterNumbers.map(ch => (
        <Link
          key={ch}
          href={`/bible/${language}/${version}/${currentBook.id}/${ch}`}
          onClick={() => { setIsChapterNavOpen(false); setIsMainChapterOpen(false) }}
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

  // ── Highlight colour swatches ──────────────────────────────────────
  const highlightSwatches = user && (
    <div className="flex items-center gap-1.5 flex-wrap">
      {HIGHLIGHT_COLORS.map(c => (
        <button
          key={c.value}
          title={c.name}
          onClick={() => handleHighlightAll(uniformHighlightColor === c.value ? "" : c.value)}
          className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
            uniformHighlightColor === c.value
              ? "border-slate-700 scale-110 shadow-md"
              : "border-transparent hover:border-slate-400"
          }`}
          style={{ backgroundColor: c.value }}
        />
      ))}
      {anyHighlighted && (
        <button
          onClick={() => handleHighlightAll("")}
          title="Remove highlight"
          className="w-7 h-7 rounded-full border-2 border-transparent hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )

  // ── Copy button (shared in panel + action bar) ────────────────────
  const copyBtn = (small = false) => (
    <button
      onClick={copySelectedVerses}
      className={`flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all ${
        copied
          ? "text-green-700 bg-green-50 border border-green-200"
          : "text-slate-600 bg-white hover:bg-slate-100 border border-slate-200"
      } ${small ? "h-7 text-xs px-2" : "flex-1 h-7 text-xs"}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )

  // ── Right panel / mobile sheet shared content ────────────────────
  const panelContent = (
    <div className="space-y-4">
      {/* Collections */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
          My collections
        </p>
        {user ? (
          <div className="space-y-2">
            {selectedVerseIds.size > 0 && (
              <button
                onClick={() => { setIsCollectionDialogOpen(true); setIsMobilePanelOpen(false) }}
                className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
              >
                <BookMarked className="w-3.5 h-3.5" />
                Save {selectedVerseIds.size} verse{selectedVerseIds.size !== 1 ? "s" : ""}
              </button>
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
            <a href="/auth/login" className="underline underline-offset-2 hover:text-slate-600">Sign in</a>{" "}
            to save verses to collections.
          </p>
        )}
      </div>

      {/* Selected verse + actions */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
        {selectedVerseIds.size > 0 ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
              {selectedVerseIds.size} verse{selectedVerseIds.size !== 1 ? "s" : ""} selected
            </p>
            {activeVerse && activeVerseText && (
              <div className="mb-3">
                <p className="text-xs font-bold text-blue-600 mb-1">
                  {currentBookName} {currentChapter}:{activeVerse}
                </p>
                <p className="text-[13px] text-slate-700 leading-relaxed font-serif">
                  {activeVerseText.length > 160 ? activeVerseText.slice(0, 157) + "…" : activeVerseText}
                </p>
              </div>
            )}
            {user && (
              <div className="mb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Highlight</p>
                {highlightSwatches}
              </div>
            )}
            <div className="flex gap-1.5">
              {copyBtn()}
              {user && (
                <button
                  onClick={() => { setIsCollectionDialogOpen(true); setIsMobilePanelOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
                >
                  <BookMarked className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>
            <button
              onClick={clearSelection}
              className="mt-2 w-full text-center text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors"
            >
              Clear selection
            </button>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
              Selected Verse
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tap a verse number to select it. Tap more to build a multi-verse selection.
            </p>
          </>
        )}
      </div>

      {/* Reading preferences */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
          Reading
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Text size</p>
        <div className="flex items-center gap-1.5 mb-4">
          {(["S", "M", "L"] as const).map((label, i) => (
            <button
              key={i}
              onClick={() => changeFontSize(i)}
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
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">View</p>
        <div className="p-1 bg-slate-100 rounded-xl flex gap-1">
          <button
            onClick={() => changeViewMode("line")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "line"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            By verse
          </button>
          <button
            onClick={() => changeViewMode("paragraph")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "paragraph"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
            Paragraph
          </button>
        </div>
      </div>

      {/* Commentary placeholder */}
      <div className="rounded-xl border border-dashed border-slate-200 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-1.5">
          Commentary
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">Verse commentary coming soon.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">

      {/* ═══ MOBILE TOP BAR ══════════════════════════════════════════ */}
      <div className="sticky top-16 z-30 lg:hidden bg-white/95 backdrop-blur-sm border-b border-slate-100/80">
        <div className="px-4 h-11 flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            <span className="text-slate-600 font-medium truncate max-w-[120px]">{currentBookName}</span>
            <span className="text-slate-300 select-none">/</span>
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">{currentBookName}</p>
                  {chapterGrid}
                </div>
              )}
            </div>
          </nav>
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

      {/* ═══ THREE-COLUMN BODY ═══════════════════════════════════════ */}
      <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr_256px]">

        {/* Left: book navigation */}
        <aside className="hidden lg:flex lg:flex-col border-r border-slate-100 sticky top-16 self-start h-[calc(100vh-4rem)] z-10">
          <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700 truncate">{currentBookName}</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "none" }}>
            <BookSidebar books={books} currentBook={currentBook} language={language} version={version} />
          </div>
        </aside>

        {/* Center: reading area — data-selection-zone so clicks here keep selection */}
        <main className="px-6 sm:px-10 py-8 sm:py-10 pb-32 lg:pb-16" data-selection-zone>
          <div className="mb-7">
            {/* Book + chapter dropdown nav label */}
            <div ref={mainChapterNavRef} className="relative flex items-center gap-1 mb-1.5">
              <span className="text-sm font-medium text-slate-500">{currentBookName}</span>
              <span className="text-slate-300 select-none">/</span>
              <button
                onClick={() => setIsMainChapterOpen(v => !v)}
                className="flex items-center gap-0.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                {currentChapter}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isMainChapterOpen ? "rotate-180" : ""}`} />
              </button>
              {isMainChapterOpen && (
                <div className="absolute top-full left-0 mt-2 z-[200] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-3 w-[272px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">{currentBookName}</p>
                  {chapterGrid}
                </div>
              )}
            </div>
            {/* Original "1 of 36 · N verses" display — unchanged */}
            <div className="flex items-baseline gap-2">
              <h1 className="text-[26px] font-bold text-slate-900 leading-none">{currentChapter}</h1>
              <span className="text-sm text-slate-400 font-medium">of {chapterNumbers.length}</span>
              <span className="text-xs text-slate-300 ml-0.5">· {verses.length} verses</span>
            </div>
          </div>

          <VerseList
            verses={verses}
            dir={dir}
            user={user}
            localHighlights={localHighlights}
            fontSize={fontSize}
            selectedVerseIds={selectedVerseIds}
            viewMode={viewMode}
            onVerseClick={handleVerseClick}
          />

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

        {/* Right: controls panel (desktop) — data-selection-zone so clicks here keep selection */}
        <aside
          className="hidden lg:flex lg:flex-col border-l border-slate-100 sticky top-16 self-start h-[calc(100vh-4rem)]"
          data-selection-zone
        >
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
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">{panelContent}</div>
        </aside>
      </div>

      {/* ═══ MOBILE FLOATING ACTION BAR ══════════════════════════════ */}
      {selectedVerseIds.size > 0 && (
        <div
          className="fixed bottom-16 inset-x-0 lg:hidden z-20 px-3 pb-2"
          data-selection-zone
        >
          <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Row 1: count + dismiss */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                {selectedVerseIds.size} verse{selectedVerseIds.size !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={clearSelection}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Row 2: colours + copy + save */}
            <div className="flex items-center gap-3 px-4 pb-3 flex-wrap">
              {user && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {HIGHLIGHT_COLORS.map(c => (
                    <button
                      key={c.value}
                      title={c.name}
                      onClick={() => handleHighlightAll(uniformHighlightColor === c.value ? "" : c.value)}
                      className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                        uniformHighlightColor === c.value ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  {anyHighlighted && (
                    <button
                      onClick={() => handleHighlightAll("")}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="w-px h-4 bg-slate-700 flex-shrink-0" />

              {/* Copy */}
              <button
                onClick={copySelectedVerses}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors flex-shrink-0 ${
                  copied ? "text-green-400" : "text-slate-200 hover:text-white"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>

              {user && (
                <button
                  onClick={() => setIsCollectionDialogOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors flex-shrink-0"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MOBILE BOTTOM BAR ═══════════════════════════════════════ */}
      <div
        className="fixed bottom-0 inset-x-0 bg-white/96 backdrop-blur-sm border-t border-slate-200 px-5 py-3 flex items-center justify-between lg:hidden z-30"
        data-selection-zone
      >
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
          onClick={() => setIsMobilePanelOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Panel
        </button>
      </div>

      {/* ═══ MOBILE BOOK DRAWER ═════════════════════════════════════ */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton={false} onOpenAutoFocus={e => e.preventDefault()}>
          <SheetTitle className="sr-only">Book Navigation</SheetTitle>
          <div className="p-4 h-full overflow-hidden flex flex-col">
            <BookSidebar books={books} currentBook={currentBook} language={language} version={version} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══ MOBILE CONTROLS PANEL ══════════════════════════════════ */}
      <Sheet open={isMobilePanelOpen} onOpenChange={setIsMobilePanelOpen}>
        <SheetContent side="right" className="w-80 p-0 flex flex-col" onOpenAutoFocus={e => e.preventDefault()}>
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
          <div className="flex-1 overflow-y-auto px-5 py-5">{panelContent}</div>
        </SheetContent>
      </Sheet>

      {/* ═══ COLLECTION DIALOG & SEARCH ════════════════════════════ */}
      <CollectionDialog
        open={isCollectionDialogOpen}
        selectedVerseIds={[...selectedVerseIds]}
        selectedVerseNums={selectedVerseNums}
        bookName={currentBookName}
        chapter={currentChapter}
        onClose={() => { setIsCollectionDialogOpen(false); clearSelection() }}
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
