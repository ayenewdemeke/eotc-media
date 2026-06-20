"use client"

import { useState, useRef } from "react"
import { Loader2, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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

const ISSUE_VARIANT: Record<string, "warning" | "info" | "destructive"> = {
  typo: "warning",
  incomplete: "info",
  missing_text: "destructive",
}

const selectClass =
  "w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"

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
    <div className="max-w-4xl space-y-6 p-4 lg:p-6">
      <PageHeader title="Verse corrections" description="Scan chapters for text issues and apply fixes." />

      {/* Selection bar */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          {/* Translation */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Translation</label>
            <div className="relative">
              <select
                className={selectClass}
                value={translationCode}
                onChange={e => setTranslationCode(e.target.value)}
                disabled={scanning}
              >
                {translations.map(t => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Book */}
          <div className="flex min-w-[200px] flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Book</label>
            <div className="relative">
              <select
                className={selectClass}
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
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Chapter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Chapter</label>
            <div className="relative">
              <select
                className={selectClass}
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
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Scan / Stop buttons */}
          <div className="flex items-end gap-2">
            <Button onClick={handleScan} disabled={!canScan}>
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning…
                </>
              ) : "Scan"}
            </Button>
            {scanning && (
              <Button variant="outline" onClick={() => { abortRef.current = true }}>
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {progress && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress}
        </div>
      )}

      {/* Results */}
      {scanned && !scanning && (
        <>
          <div className="flex items-center gap-2">
            {pendingCount === 0 && active.length === 0 ? (
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                No issues found in this selection.
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{active.filter(s => !s._status).length}</span> issue{active.filter(s => !s._status).length !== 1 ? "s" : ""} found
                {active.some(s => s._status === "accepted") && (
                  <span className="ml-2 text-success">&bull; {active.filter(s => s._status === "accepted").length} accepted</span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {suggestions.map((s, idx) => {
              if (s._status === "declined") return null
              return (
                <Card
                  key={`${s.chapter}-${s.verseNum}-${idx}`}
                  className={cn(s._status === "accepted" && "border-success/40 bg-success/5")}
                >
                  <CardContent className="p-4">
                    {/* Top row: verse badge + issue type + status */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-foreground px-2 py-0.5 font-mono text-xs text-background">
                        {s.chapter}:{s.verseNum}
                      </span>
                      <Badge variant={ISSUE_VARIANT[s.issueType] ?? "secondary"}>
                        {ISSUE_LABELS[s.issueType] ?? s.issueType}
                      </Badge>
                      {s.warning === "no_verse_record" && (
                        <Badge variant="warning" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Verse not in database
                        </Badge>
                      )}
                      {s._status === "accepted" && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Accepted
                        </span>
                      )}
                    </div>

                    {/* Texts */}
                    {s.originalText && (
                      <div className="mb-2">
                        <p className="mb-0.5 text-xs font-medium text-muted-foreground">Original</p>
                        <p className="font-mono text-sm leading-relaxed text-muted-foreground">{s.originalText}</p>
                      </div>
                    )}

                    <div className="mb-2">
                      <p className="mb-0.5 text-xs font-medium text-muted-foreground">Suggestion</p>
                      {s._status === "editing" ? (
                        <Textarea
                          className="min-h-[60px] resize-y font-mono leading-relaxed"
                          value={s._editedText ?? s.suggestedText}
                          onChange={e => handleEditChange(idx, e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <p className="font-mono text-sm leading-relaxed text-foreground">{s.suggestedText}</p>
                      )}
                    </div>

                    <p className="mb-3 text-xs italic text-muted-foreground">{s.reason}</p>

                    {/* Actions */}
                    {s._status !== "accepted" && (
                      <div className="flex flex-wrap items-center gap-2">
                        {s.warning !== "no_verse_record" && (
                          <>
                            {s._status === "editing" ? (
                              <>
                                <Button size="sm" onClick={() => handleAccept(idx, s._editedText)}>Apply</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleEditCancel(idx)}>Cancel</Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" onClick={() => handleAccept(idx)}>Accept</Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditStart(idx)}>Edit</Button>
                              </>
                            )}
                          </>
                        )}
                        {s._status !== "editing" && (
                          <Button size="sm" variant="ghost" onClick={() => handleDecline(idx)}>
                            {s.warning === "no_verse_record" ? "Dismiss" : "Decline"}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
