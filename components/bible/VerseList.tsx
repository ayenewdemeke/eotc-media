"use client"

import { BookOpen } from "lucide-react"
import { BlVerse } from "@/types/models/bible"

export type VerseViewMode = "paragraph" | "line"

interface VerseListProps {
  verses: BlVerse[]
  dir: "ltr" | "rtl"
  activeVerse: number | null
  user: unknown
  localHighlights: Map<number, string>
  fontSize: number
  selectMode: boolean
  selectedVerseIds: Set<number>
  viewMode: VerseViewMode
  onVerseClick: (verseNum: number, verseId: number, el: HTMLElement) => void
}

export default function VerseList({
  verses,
  dir,
  activeVerse,
  user,
  localHighlights,
  fontSize,
  selectMode,
  selectedVerseIds,
  viewMode,
  onVerseClick,
}: VerseListProps) {
  if (verses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <BookOpen className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
        <p className="font-semibold">No text available</p>
        <p className="text-sm mt-1 opacity-60">Try a different translation or chapter</p>
      </div>
    )
  }

  // ── Shared helpers ──────────────────────────────────────
  const numBtnClass = (isSelected: boolean, isActive: boolean) =>
    `transition-colors duration-100 select-none not-italic font-bold ${
      selectMode ? "cursor-pointer" : user ? "cursor-pointer hover:text-blue-600" : "cursor-default"
    } ${
      isSelected ? "text-blue-600 font-black"
      : isActive && !selectMode ? "text-blue-500 font-black"
      : "text-blue-300"
    }`

  // ── Paragraph mode (original) ───────────────────────────
  if (viewMode === "paragraph") {
    return (
      <div dir={dir}>
        <p
          className="font-serif leading-[1.95] text-slate-800 tracking-[0.005em]"
          style={{ fontSize: `${fontSize}px`, fontVariantNumeric: "oldstyle-nums" }}
        >
          {verses.map(verse => {
            const highlightColor = localHighlights.get(verse.id)
            const isActive = activeVerse === verse.verse
            const isSelected = selectMode && selectedVerseIds.has(verse.id)

            let spanStyle: React.CSSProperties | undefined
            if (isSelected) {
              spanStyle = { backgroundColor: "#dbeafe", borderRadius: "3px", padding: "1px 3px", margin: "0 -3px", outline: "2px solid #3b82f6", outlineOffset: "1px" }
            } else if (highlightColor) {
              spanStyle = { backgroundColor: `${highlightColor}60`, borderRadius: "3px", padding: "1px 3px", margin: "0 -3px" }
            } else if (isActive && !selectMode) {
              spanStyle = { backgroundColor: "#dbeafe", borderRadius: "3px", padding: "1px 3px", margin: "0 -3px" }
            }

            return (
              <span
                key={verse.id}
                id={`verse-${verse.verse}`}
                onClick={selectMode ? e => onVerseClick(verse.verse, verse.id, e.currentTarget as HTMLElement) : undefined}
                className={`relative transition-colors duration-150 ${selectMode ? "cursor-pointer" : ""}`}
                style={spanStyle}
              >
                <button
                  type="button"
                  onClick={selectMode ? undefined : e => onVerseClick(verse.verse, verse.id, e.currentTarget)}
                  title={selectMode ? "Click to select" : user ? "Click to highlight" : "Sign in to highlight"}
                  className={`inline leading-none ${numBtnClass(isSelected, isActive)}`}
                  style={{ fontSize: "0.6em", marginRight: "0.25em", verticalAlign: "super", lineHeight: 1 }}
                >
                  {verse.verse}
                </button>
                {verse.text || (
                  <span className="text-slate-400 italic not-italic" style={{ fontSize: "0.875em" }}>
                    [no text]
                  </span>
                )}
                {" "}
              </span>
            )
          })}
        </p>

        {!user && !selectMode && (
          <p className="mt-10 text-xs text-slate-400 text-center">
            <a href="/auth/login" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
              Sign in
            </a>{" "}
            to highlight and save verses
          </p>
        )}
      </div>
    )
  }

  // ── Verse-per-line mode ─────────────────────────────────
  return (
    <div dir={dir} className="space-y-0.5">
      {verses.map(verse => {
        const highlightColor = localHighlights.get(verse.id)
        const isActive = activeVerse === verse.verse
        const isSelected = selectMode && selectedVerseIds.has(verse.id)

        let rowStyle: React.CSSProperties | undefined
        if (isSelected) {
          rowStyle = { backgroundColor: "#dbeafe", outline: "2px solid #3b82f6", outlineOffset: "1px", borderRadius: "8px" }
        } else if (highlightColor) {
          rowStyle = { backgroundColor: `${highlightColor}40`, borderRadius: "8px" }
        } else if (isActive && !selectMode) {
          rowStyle = { backgroundColor: "#dbeafe", borderRadius: "8px" }
        }

        return (
          <div
            key={verse.id}
            id={`verse-${verse.verse}`}
            onClick={selectMode ? e => onVerseClick(verse.verse, verse.id, e.currentTarget as HTMLElement) : undefined}
            className={`flex items-start gap-2.5 px-2 py-1.5 transition-colors duration-150 ${selectMode ? "cursor-pointer" : ""}`}
            style={rowStyle}
          >
            <button
              type="button"
              onClick={selectMode ? undefined : e => onVerseClick(verse.verse, verse.id, e.currentTarget)}
              title={selectMode ? "Click to select" : user ? "Click to highlight" : "Sign in to highlight"}
              className={`flex-shrink-0 w-7 text-right text-xs leading-none mt-[0.35em] ${numBtnClass(isSelected, isActive)}`}
            >
              {verse.verse}
            </button>
            <span
              className="flex-1 font-serif leading-relaxed text-slate-800 tracking-[0.005em]"
              style={{ fontSize: `${fontSize}px` }}
            >
              {verse.text || <span className="text-slate-400 italic">[no text]</span>}
            </span>
          </div>
        )
      })}

      {!user && !selectMode && (
        <p className="mt-10 text-xs text-slate-400 text-center">
          <a href="/auth/login" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
            Sign in
          </a>{" "}
          to highlight and save verses
        </p>
      )}
    </div>
  )
}
