"use client"

import { BookOpen } from "lucide-react"
import { BlVerse } from "@/types/models/bible"

interface VerseListProps {
  verses: BlVerse[]
  dir: "ltr" | "rtl"
  activeVerse: number | null
  user: unknown
  localHighlights: Map<number, string>
  fontSize: number
  onVerseClick: (verseNum: number, verseId: number, el: HTMLElement) => void
}

export default function VerseList({
  verses,
  dir,
  activeVerse,
  user,
  localHighlights,
  fontSize,
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

  return (
    <div dir={dir}>
      {/* Flowing inline prose — verses run together like a book */}
      <p
        className="font-serif leading-[1.95] text-slate-800 tracking-[0.005em]"
        style={{ fontSize: `${fontSize}px`, fontVariantNumeric: "oldstyle-nums" }}
      >
        {verses.map(verse => {
          const highlightColor = localHighlights.get(verse.id)
          const isActive = activeVerse === verse.verse

          return (
            <span
              key={verse.id}
              id={`verse-${verse.verse}`}
              className="relative transition-colors duration-150"
              style={
                highlightColor
                  ? { backgroundColor: `${highlightColor}60`, borderRadius: "3px", padding: "1px 3px", margin: "0 -3px" }
                  : isActive
                  ? { backgroundColor: "#dbeafe", borderRadius: "3px", padding: "1px 3px", margin: "0 -3px" }
                  : undefined
              }
            >
              {/* Verse number — clickable superscript */}
              <button
                type="button"
                onClick={e => onVerseClick(verse.verse, verse.id, e.currentTarget)}
                title={user ? "Click to highlight" : "Sign in to highlight"}
                className={`inline leading-none transition-colors duration-100 select-none not-italic ${
                  user
                    ? "cursor-pointer hover:text-blue-600"
                    : "cursor-default"
                } ${
                  isActive ? "text-blue-500 font-black" : "text-blue-300 font-bold"
                }`}
                style={{ fontSize: "0.6em", marginRight: "0.25em", verticalAlign: "super", lineHeight: 1 }}
              >
                {verse.verse}
              </button>
              {/* Verse text */}
              {verse.text || (
                <span className="text-slate-400 italic not-italic" style={{ fontSize: "0.875em" }}>
                  [no text]
                </span>
              )}
              {/* Space between verses */}
              {" "}
            </span>
          )
        })}
      </p>

      {/* Sign-in nudge */}
      {!user && (
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
