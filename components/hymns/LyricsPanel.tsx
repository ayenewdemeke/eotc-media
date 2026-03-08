"use client"

import { Music } from "lucide-react"

interface LyricsPanelProps {
  lyrics: string | null
}

export default function LyricsPanel({ lyrics }: LyricsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Music className="w-4 h-4 text-violet-500" />
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Lyrics</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 14rem)", scrollbarWidth: "thin" }}>
        {lyrics ? (
          <div
            className="font-serif text-[15px] leading-[1.9] text-slate-700 [&_p]:mb-3 [&_br]:block"
            dangerouslySetInnerHTML={{ __html: lyrics }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Music className="w-10 h-10 mb-3 opacity-20" strokeWidth={1.5} />
            <p className="text-sm font-medium">Lyrics not yet available</p>
          </div>
        )}
      </div>
    </div>
  )
}
