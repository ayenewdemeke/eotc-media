"use client"

import { BookOpen } from "lucide-react"
import { BlVerse } from "@/types/models/bible"

export type VerseViewMode = "paragraph" | "line"

// ── Verse group (for line mode: empty verses merged with next verse) ──
type VerseGroup = {
  ids: number[]        // all verse IDs in the group
  nums: number[]       // all verse numbers (e.g. [2, 3] for a merged group)
  text: string | null  // text from the last (non-empty) verse
}

function buildVerseGroups(verses: BlVerse[]): VerseGroup[] {
  const groups: VerseGroup[] = []
  const buffer: { id: number; num: number }[] = []

  for (const v of verses) {
    const hasText = !!(v.text && v.text.trim().length > 0)
    if (!hasText) {
      buffer.push({ id: v.id, num: v.verse })
    } else {
      groups.push({
        ids:  [...buffer.map(b => b.id),  v.id],
        nums: [...buffer.map(b => b.num), v.verse],
        text: v.text,
      })
      buffer.length = 0
    }
  }

  // Trailing empty verses (no following verse with text)
  if (buffer.length > 0) {
    groups.push({ ids: buffer.map(b => b.id), nums: buffer.map(b => b.num), text: null })
  }

  return groups
}

interface VerseListProps {
  verses: BlVerse[]
  dir: "ltr" | "rtl"
  user: unknown
  localHighlights: Map<number, string>
  fontSize: number
  selectedVerseIds: Set<number>
  viewMode: VerseViewMode
  /** Called with arrays so grouped verses (e.g. "2–3") select all IDs at once */
  onVerseClick: (verseNums: number[], verseIds: number[]) => void
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

            // Selection: background only (no outline), highlight colour shows through
            const bgColor = isSelected ? (highlightColor ?? "#eff6ff") : highlightColor
            const spanStyle: React.CSSProperties | undefined = bgColor
              ? { backgroundColor: bgColor, borderRadius: "3px", padding: "1px 3px", margin: "0 -3px" }
              : undefined

            return (
              <span
                key={verse.id}
                id={`verse-${verse.verse}`}
                style={spanStyle}
                className="relative transition-colors duration-150"
              >
                <button
                  type="button"
                  onClick={() => onVerseClick([verse.verse], [verse.id])}
                  title={user ? "Tap to select" : "Tap to select · sign in to highlight"}
                  className={`inline leading-none select-none not-italic cursor-pointer transition-colors duration-100 ${
                    isSelected ? "text-blue-600 font-black" : "text-blue-300 font-bold hover:text-blue-500"
                  }`}
                  style={{ fontSize: "0.6em", marginRight: "0.25em", verticalAlign: "super", lineHeight: 1 }}
                >
                  {verse.verse}
                </button>
                {/* Empty verses: just the number, no placeholder text */}
                {verse.text || null}
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
  const groups = buildVerseGroups(verses)

  return (
    <div dir={dir}>
      {groups.map(group => {
        // Use highlight of the last verse in the group (the one with text)
        const lastId = group.ids[group.ids.length - 1]
        const highlightColor = localHighlights.get(lastId)
        const isSelected = group.ids.some(id => selectedVerseIds.has(id))

        // Selection visual: background only, no outline
        const bgColor = isSelected ? (highlightColor ?? "#eff6ff") : highlightColor
        const rowStyle: React.CSSProperties | undefined = bgColor
          ? { backgroundColor: bgColor, borderRadius: "6px" }
          : undefined

        // Verse number label: "3" or "2–3" for merged groups
        const numLabel = group.nums.length === 1
          ? String(group.nums[0])
          : `${group.nums[0]}–${group.nums[group.nums.length - 1]}`

        return (
          <div
            key={group.ids[0]}
            // Anchor for first verse in the group; hidden spans for the rest
            id={`verse-${group.nums[0]}`}
            onClick={() => onVerseClick(group.nums, group.ids)}
            className={`flex items-start gap-1.5 pr-2 py-[5px] cursor-pointer rounded-md transition-colors duration-150 ${
              !bgColor ? "hover:bg-slate-50" : ""
            }`}
            style={rowStyle}
          >
            {/* Hidden scroll anchors for merged verse numbers */}
            {group.nums.slice(1).map(n => (
              <span key={n} id={`verse-${n}`} aria-hidden />
            ))}

            <span
              className={`flex-shrink-0 text-[11px] font-bold leading-none mt-[0.32em] transition-colors select-none ${
                isSelected ? "text-blue-600" : "text-blue-300"
              }`}
            >
              {numLabel}
            </span>
            <span
              className="flex-1 font-serif leading-[1.7] text-slate-800 tracking-[0.005em]"
              style={{ fontSize: `${fontSize}px` }}
            >
              {group.text || <span className="text-slate-400 italic text-sm">[no text]</span>}
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
