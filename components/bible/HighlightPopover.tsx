"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

const COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green",  value: "#bbf7d0" },
  { name: "Blue",   value: "#bfdbfe" },
  { name: "Red",    value: "#fecaca" },
  { name: "Purple", value: "#e9d5ff" },
]

interface HighlightPopoverProps {
  verseNum: number | null
  position: { top: number; left: number } | null
  currentColor?: string | null
  onHighlight: (color: string) => void
  onClose: () => void
}

export default function HighlightPopover({
  verseNum,
  position,
  currentColor,
  onHighlight,
  onClose,
}: HighlightPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!position) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [position, onClose])

  if (!position || verseNum === null) return null

  return (
    <div
      ref={ref}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[100] bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-3 w-auto animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Verse {verseNum}
        </span>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-2 mb-2.5">
        {COLORS.map(c => (
          <button
            key={c.value}
            title={c.name}
            onClick={() => onHighlight(c.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110 ${
              currentColor === c.value
                ? "border-slate-700 scale-110 shadow-md"
                : "border-transparent hover:border-slate-300"
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      {/* Remove */}
      {currentColor && (
        <button
          onClick={() => onHighlight("")}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-700 py-1 transition-colors"
        >
          Remove highlight
        </button>
      )}
    </div>
  )
}
