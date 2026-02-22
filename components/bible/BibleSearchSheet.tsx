"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Search, X, BookOpen } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BibleLanguage, BibleVersion, BibleSearchResult } from "@/types/models/bible"

interface BibleSearchSheetProps {
  isOpen: boolean
  onClose: () => void
  language: BibleLanguage
  version: BibleVersion
  currentBookId: number
}

type Scope = "whole_bible" | "old_testament" | "new_testament" | "current_book"

const SCOPE_LABELS: Array<{ value: Scope; label: string }> = [
  { value: "whole_bible",   label: "Whole Bible" },
  { value: "old_testament", label: "Old Testament" },
  { value: "new_testament", label: "New Testament" },
  { value: "current_book",  label: "This Book" },
]

const TRANSLATIONS = [
  { value: "amharic__1954",                           label: "Amharic 1954" },
  { value: "english__kjv",                            label: "English KJV" },
  { value: "oromifa__v1",                             label: "Oromifa" },
  { value: "hebrew-greek__masoretic-textus-receptus", label: "Hebrew / Greek" },
  { value: "greek__septuagint",                       label: "Greek LXX" },
]

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export default function BibleSearchSheet({
  isOpen,
  onClose,
  language,
  version,
  currentBookId,
}: BibleSearchSheetProps) {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<Scope>("whole_bible")
  const [searchTranslationKey, setSearchTranslationKey] = useState(`${language}__${version}`)
  const [results, setResults] = useState<BibleSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the default translation in sync when the reader's translation changes
  useEffect(() => {
    setSearchTranslationKey(`${language}__${version}`)
  }, [language, version])

  const doSearch = useCallback(
    async (q: string, s: Scope, translationKey: string) => {
      if (q.trim().length < 2) { setResults([]); return }
      setLoading(true)
      try {
        const params = new URLSearchParams({
          search: q,
          bible_type: translationKey,
          scope: s,
          ...(s === "current_book" ? { book_id: String(currentBookId) } : {}),
        })
        const res = await fetch(`/api/bible/search?${params}`)
        const data = await res.json()
        setResults(data.verses ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [currentBookId]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => doSearch(query, scope, searchTranslationKey), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, scope, searchTranslationKey, doSearch])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  // Derive language/version from searchTranslationKey for result links
  const [searchLang, searchVer] = searchTranslationKey.split("__") as [BibleLanguage, BibleVersion]

  // Group results by book name
  const grouped: Record<string, BibleSearchResult[]> = {}
  for (const r of results) {
    if (!grouped[r.bookName]) grouped[r.bookName] = []
    grouped[r.bookName].push(r)
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      {/* showCloseButton={false} — we provide our own close button in the header */}
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0" showCloseButton={false}>
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-lg font-bold text-slate-900">Search</SheetTitle>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Translation selector */}
          <div className="mt-3">
            <Select value={searchTranslationKey} onValueChange={setSearchTranslationKey}>
              <SelectTrigger className="h-8 text-xs w-full bg-slate-50 border border-slate-200 text-slate-700 focus:ring-0 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATIONS.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search input */}
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search verses…"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope pills */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {SCOPE_LABELS.map(s => (
              <button
                key={s.value}
                onClick={() => setScope(s.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                  scope === s.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </SheetHeader>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Result count */}
          {!loading && query.trim().length >= 2 && (
            <div className="px-5 py-2.5 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                {results.length === 0
                  ? "No results"
                  : `${results.length} result${results.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}

          {/* Skeleton loading */}
          {loading && (
            <div className="px-5 py-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-12 h-5 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No query */}
          {!loading && query.trim().length < 2 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 px-6 text-center">
              <Search className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Type to search</p>
              <p className="text-xs mt-1 opacity-70">Search for words or phrases across the Bible</p>
            </div>
          )}

          {/* Empty results */}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 px-6 text-center">
              <BookOpen className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 opacity-70">Try a different word or change the scope</p>
            </div>
          )}

          {/* Grouped results */}
          {!loading && results.length > 0 &&
            Object.entries(grouped).map(([bookName, bookResults]) => (
              <div key={bookName}>
                <div className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50/80 border-b border-slate-100 sticky top-0">
                  {bookName}{" "}
                  <span className="font-normal normal-case tracking-normal text-slate-400">
                    ({bookResults.length})
                  </span>
                </div>
                {bookResults.map(r => (
                  <Link
                    key={r.verseId}
                    href={`/bible/${searchLang}/${searchVer}/${r.bookId}/${r.chapter}?verse=${r.verse}`}
                    onClick={onClose}
                    className="flex items-start gap-3 px-5 py-3 border-b border-slate-100/70 hover:bg-blue-50/50 transition-colors group"
                  >
                    <span className="flex-shrink-0 mt-0.5 text-xs font-bold font-mono text-blue-500 bg-blue-50 group-hover:bg-blue-100 px-2 py-0.5 rounded-md whitespace-nowrap transition-colors">
                      {r.chapter}:{r.verse}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 group-hover:text-slate-900 transition-colors">
                      {highlightMatch(r.text, query)}
                    </p>
                  </Link>
                ))}
              </div>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
