"use client"

import { BookOpen } from "lucide-react"
import { BlVerse } from "@/types/models/bible"

export type VerseViewMode = "paragraph" | "line"

interface VerseListProps {
  verses: BlVerse[]
  dir: "ltr" | "rtl"
  user: unknown
  localHighlights: Map<number, string>
  fontSize: number
  selectedVerseIds: Set<number>
  viewMode: VerseViewMode
  onVerseClick: (verseNum: number, verseId: number) => void
}

export default function VerseList({
  verses,
  dir,
  user,
  localHighlights,
  fontSize,
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

  // ── Paragraph mode ──────────────────────────────────────
  if (viewMode === "paragraph") {
    return (
      <div dir={dir}>
        <p
          className="font-serif leading-[1.95] text-slate-800 tracking-[0.005em]"
          style={{ fontSize: `${fontSize}px`, fontVariantNumeric: "oldstyle-nums" }}
        >
          {verses.map(verse => {
            const highlightColor = localHighlights.get(verse.id)
            const isSelected = selectedVerseIds.has(verse.id)

            // Build background: selected shows ring + fill; highlighted shows color fill
            const bgColor = isSelected ? (highlightColor ?? "#eff6ff") : highlightColor
            const spanStyle: React.CSSProperties | undefined = (bgColor || isSelected)
              ? {
                  backgroundColor: bgColor,
                  outline: isSelected ? "2px solid #3b82f6" : undefined,
                  outlineOffset: isSelected ? "1px" : undefined,
                  borderRadius: "3px",
                  padding: "1px 3px",
                  margin: "0 -3px",
                }
              : undefined

            return (
              <span
                key={verse.id}
                id={`verse-${verse.verse}`}
                style={spanStyle}
                className="relative transition-colors duration-150"
              >
                {/* Verse number — the click target */}
                <button
                  type="button"
                  onClick={() => onVerseClick(verse.verse, verse.id)}
                  title={user ? "Tap to select" : "Tap to select • sign in to highlight"}
                  className={`inline leading-none select-none not-italic cursor-pointer transition-colors duration-100 ${
                    isSelected ? "text-blue-700 font-black hover:text-blue-800" : "text-blue-300 font-bold hover:text-blue-500"
                  }`}
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

        {!user && selectedVerseIds.size === 0 && (
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
        const isSelected = selectedVerseIds.has(verse.id)

        const bgColor = isSelected ? (highlightColor ?? "#eff6ff") : highlightColor
        const rowStyle: React.CSSProperties | undefined = bgColor
          ? {
              backgroundColor: bgColor,
              outline: isSelected ? "2px solid #3b82f6" : undefined,
              outlineOffset: isSelected ? "1px" : undefined,
              borderRadius: "8px",
            }
          : isSelected
          ? { outline: "2px solid #3b82f6", outlineOffset: "1px", borderRadius: "8px", backgroundColor: "#eff6ff" }
          : undefined

        return (
          <div
            key={verse.id}
            id={`verse-${verse.verse}`}
            onClick={() => onVerseClick(verse.verse, verse.id)}
            className="flex items-start gap-2.5 px-2 py-1.5 cursor-pointer rounded-lg transition-colors duration-150 hover:bg-slate-50"
            style={rowStyle}
          >
            <span
              className={`flex-shrink-0 w-7 text-right text-xs font-bold leading-none mt-[0.35em] transition-colors select-none ${
                isSelected ? "text-blue-700" : "text-blue-300"
              }`}
            >
              {verse.verse}
            </span>
            <span
              className="flex-1 font-serif leading-relaxed text-slate-800 tracking-[0.005em]"
              style={{ fontSize: `${fontSize}px` }}
            >
              {verse.text || <span className="text-slate-400 italic">[no text]</span>}
            </span>
          </div>
        )
      })}

      {!user && selectedVerseIds.size === 0 && (
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
