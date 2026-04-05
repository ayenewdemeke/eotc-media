"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Pencil, X } from "lucide-react"

interface Props {
  hymnId: number
  lyrics: string | null
  lyricsSuggestion: string | null
}

export default function LyricsSection({ hymnId, lyrics, lyricsSuggestion }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [text, setText] = useState(lyricsSuggestion ?? lyrics ?? "")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/hymns/${hymnId}/suggest-lyrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics: text }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      setMode("view")
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Cancel your lyrics suggestion?")) return
    setLoading(true)
    try {
      await fetch(`/api/hymns/${hymnId}/suggest-lyrics`, { method: "DELETE" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/hymns/${hymnId}/generate-lyrics`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate")
      setText(data.lyrics)
      setMode("edit")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">ግጥም</p>

        {mode === "view" && (
          <div className="flex items-center gap-2">
            {!lyrics && !lyricsSuggestion && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? "Generating…" : "Generate with AI"}
              </button>
            )}
            {!lyricsSuggestion && (
              <button
                onClick={() => { setText(lyrics ?? ""); setMode("edit") }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                {lyrics ? "Edit lyrics" : "Add lyrics"}
              </button>
            )}
          </div>
        )}

        {mode === "edit" && (
          <button
            onClick={() => setMode("view")}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      {mode === "view" && (
        <>
          {lyricsSuggestion && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-amber-700">Suggestion pending review</p>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div
                className="text-sm text-amber-900 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: lyricsSuggestion }}
              />
            </div>
          )}
          {lyrics ? (
            <div
              className="text-sm text-slate-800 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: lyrics }}
            />
          ) : !lyricsSuggestion ? (
            <p className="text-sm text-slate-400 italic">No lyrics yet</p>
          ) : null}
        </>
      )}

      {mode === "edit" && (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={16}
            className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans leading-relaxed"
            placeholder="Paste or type lyrics here… HTML is supported (e.g. <p>verse</p><br>)"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? "Generating…" : "Generate with AI"}
              </button>
              <span className="text-xs text-slate-400">Replaces editor content</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("view")}
                className="px-4 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
