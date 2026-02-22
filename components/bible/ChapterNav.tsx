"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { BibleLanguage, BibleVersion } from "@/types/models/bible"

interface ChapterNavProps {
  chapterNumbers: number[]
  currentChapter: number
  currentBookId: number
  language: BibleLanguage
  version: BibleVersion
}

export default function ChapterNav({
  chapterNumbers,
  currentChapter,
  currentBookId,
  language,
  version,
}: ChapterNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)

  // Scroll the active pill into view when chapter changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    })
  }, [currentChapter])

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto py-4 scrollbar-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {chapterNumbers.map(ch => {
        const isActive = ch === currentChapter
        return (
          <Link
            key={ch}
            href={`/bible/${language}/${version}/${currentBookId}/${ch}`}
            ref={isActive ? activeRef : null}
            className={`flex-shrink-0 flex items-center justify-center min-w-[2.25rem] h-9 px-1 text-sm font-semibold rounded-lg transition-all duration-150 ${
              isActive
                ? "bg-white text-[#0d1b35] shadow-lg shadow-black/30"
                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            }`}
          >
            {ch}
          </Link>
        )
      })}
    </div>
  )
}
