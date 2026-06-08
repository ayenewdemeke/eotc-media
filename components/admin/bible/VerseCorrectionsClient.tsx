"use client"

import { useState, useRef } from "react"
import { BookOpen, Loader2, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react"

interface Book {
  id: number
  englishName: string
  amharicName: string | null
}

interface Translation {
  id: number
  code: string
  name: string
}

interface Suggestion {
  verseId: number | null
  verseNum: number
  chapter: number
  originalText: string
  suggestedText: string
  reason: string
  issueType: "typo" | "incomplete" | "missing_text"
  warning?: "no_verse_record"
  // client state
  _status?: "accepted" | "declined" | "editing"
  _editedText?: string
}

const ISSUE_LABELS: Record<string, string> = {
  typo: "Typo",
  incomplete: "Incomplete",
  missing_text: "Missing text",
}

const ISSUE_COLORS: Record<string, string> = {
  typo: "bg-yellow-100 text-yellow-800",
  incomplete: "bg-orange-100 text-orange-800",
  missing_text: "bg-red-100 text-red-800",
}

export function VerseCorrectionsClient({
  books,
  translations,
}: {
  books: Book[]
  translations: Translation[]
}) {
  const [translationCode, setTranslationCode] = useState(translations[0]?.code ?? "")
  const [bookId, setBookId] = useState<number | "">("")
  const [chapters, setChapters] = useState<number[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number | "all" | "">("")
  const [loadingChapters, setLoadingChapters] = useState(false)

  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [scanned, setScanned] = useState(false)

  const abortRef = useRef(false)

  async function handleBookChange(id: number) {
    setBookId(id)
    setSelectedChapter("")
    setChapters([])
    setSuggestions([])
    setScanned(false)
    setLoadingChapters(true)
    try {
      const res = await fetch(`/api/bible/admin/chapters?bookId=${id}`)
      const data = await res.json()
      setChapters(data.chapters ?? [])
    } finally {
      setLoadingChapters(false)
    }
  }

  async function scanSingleChapter(chapter: number): Promise<Suggestion[]> {
    const res = await fetch("/api/bible/admin/scan-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ translationCode, bookId, chapter }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.suggestions ?? []) as Suggestion[]
  }

  async function handleScan() {
    if (!translationCode || !bookId || selectedChapter === "") return

    abortRef.current = false
    setScanning(true)
    setScanned(false)
    setSuggestions([])
    setProgress("")

    try {
      if (selectedChapter === "all") {
        const results: Suggestion[] = []
        for (let i = 0; i < chapters.length; i++) {
          if (abortRef.current) break
          const ch = chapters[i]
          setProgress(`Scanning chapter ${i + 1} / ${chapters.length} (${ch})…`)
          const found = await scanSingleChapter(ch)
          if (found.length > 0) {
            results.push(...found)
            setSuggestions(prev => [...prev, ...found])
          }
        }
        setProgress("")
      } else {
        setProgress("Scanning…")
        const found = await scanSingleChapter(selectedChapter as number)
        setSuggestions(found)
        setProgress("")
      }
    } finally {
      setScanning(false)
      setScanned(true)
    }
  }

  async function handleAccept(idx: number, text?: string) {
    const s = suggestions[idx]
    if (!s.verseId) return
    const newText = text ?? s.suggestedText
    const res = await fetch("/api/bible/admin/corrections/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verseId: s.verseId, translationCode, newText }),
    })
    if (res.ok) {
      setSuggestions(prev =>
        prev.map((item, i) => i === idx ? { ...item, _status: "accepted" } : item)
      )
    }
  }

  function handleEditStart(idx: number) {
    setSuggestions(prev =>
      prev.map((item, i) =>
        i === idx ? { ...item, _status: "editing", _editedText: item.suggestedText } : item
      )
    )
  }

  function handleEditChange(idx: number, val: string) {
    setSuggestions(prev =>
      prev.map((item, i) => i === idx ? { ...item, _editedText: val } : item)
    )
  }

  function handleEditCancel(idx: number) {
    setSuggestions(prev =>
      prev.map((item, i) => i === idx ? { ...item, _status: undefined, _editedText: undefined } : item)
    )
  }

  function handleDecline(idx: number) {
    setSuggestions(prev =>
      prev.map((item, i) => i === idx ? { ...item, _status: "declined" } : item)
    )
  }

  const active = suggestions.filter(s => s._status !== "declined")
  const pendingCount = active.filter(s => !s._status).length

  const canScan = translationCode && bookId !== "" && selectedChapter !== "" && !scanning

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-neutral-500" />
        <h1 className="text-xl font-bold text-neutral-900">Verse Corrections</h1>
      </div>

      {/* Selection bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        {/* Translation */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-neutral-500">Translation</label>
          <div className="relative">
            <select
              className="w-full appearance-none border border-neutral-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              value={translationCode}
              onChange={e => setTranslationCode(e.target.value)}
              disabled={scanning}
            >
              {translations.map(t => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Book */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs font-medium text-neutral-500">Book</label>
          <div className="relative">
            <select
              className="w-full appearance-none border border-neutral-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              value={bookId}
              onChange={e => handleBookChange(parseInt(e.target.value))}
              disabled={scanning}
            >
              <option value="">Select book…</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.amharicName ? `${b.amharicName} (${b.englishName})` : b.englishName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Chapter */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-neutral-500">Chapter</label>
          <div className="relative">
            <select
              className="w-full appearance-none border border-neutral-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:opacity-50"
              value={selectedChapter}
              onChange={e => setSelectedChapter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              disabled={scanning || loadingChapters || chapters.length === 0}
            >
              <option value="">{loadingChapters ? "Loading…" : "Select chapter…"}</option>
              {chapters.length > 0 && <option value="all">All chapters</option>}
              {chapters.map(ch => (
                <option key={ch} value={ch}>Chapter {ch}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Scan / Stop button */}
        {scanning ? (
          <>
            <button
              disabled
              className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg opacity-60 flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning…
            </button>
            <button
              onClick={() => { abortRef.current = true }}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            onClick={handleScan}
            disabled={!canScan}
            className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Scan
          </button>
        )}
      </div>

      {/* Progress */}
      {progress && (
        <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          {progress}
        </div>
      )}

      {/* Results */}
      {scanned && !scanning && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {pendingCount === 0 && active.length === 0 ? (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                No issues found in this selection.
              </div>
            ) : (
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">{active.filter(s => !s._status).length}</span> issue{active.filter(s => !s._status).length !== 1 ? "s" : ""} found
                {active.some(s => s._status === "accepted") && (
                  <span className="ml-2 text-green-600">&bull; {active.filter(s => s._status === "accepted").length} accepted</span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {suggestions.map((s, idx) => {
              if (s._status === "declined") return null
              return (
                <div
                  key={`${s.chapter}-${s.verseNum}-${idx}`}
                  className={`bg-white border rounded-xl p-4 ${s._status === "accepted" ? "border-green-200 bg-green-50" : "border-neutral-200"}`}
                >
                  {/* Top row: verse badge + issue type + status */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-0.5 bg-neutral-900 text-white text-xs font-mono rounded-md">
                      {s.chapter}:{s.verseNum}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${ISSUE_COLORS[s.issueType] ?? "bg-neutral-100 text-neutral-700"}`}>
                      {ISSUE_LABELS[s.issueType] ?? s.issueType}
                    </span>
                    {s.warning === "no_verse_record" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        Verse not in database
                      </span>
                    )}
                    {s._status === "accepted" && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium ml-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accepted
                      </span>
                    )}
                  </div>

                  {/* Texts */}
                  {s.originalText && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-neutral-400 mb-0.5">Original</p>
                      <p className="text-sm text-neutral-400 font-mono leading-relaxed">{s.originalText}</p>
                    </div>
                  )}

                  <div className="mb-2">
                    <p className="text-xs font-medium text-neutral-500 mb-0.5">Suggestion</p>
                    {s._status === "editing" ? (
                      <textarea
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-y min-h-[60px]"
                        value={s._editedText ?? s.suggestedText}
                        onChange={e => handleEditChange(idx, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-neutral-800 font-mono leading-relaxed">{s.suggestedText}</p>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400 italic mb-3">{s.reason}</p>

                  {/* Actions */}
                  {s._status !== "accepted" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.warning !== "no_verse_record" && (
                        <>
                          {s._status === "editing" ? (
                            <>
                              <button
                                onClick={() => handleAccept(idx, s._editedText)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => handleEditCancel(idx)}
                                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleAccept(idx)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleEditStart(idx)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {s._status !== "editing" && (
                        <button
                          onClick={() => handleDecline(idx)}
                          className="px-3 py-1.5 bg-neutral-100 text-neutral-500 text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                        >
                          {s.warning === "no_verse_record" ? "Dismiss" : "Decline"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
