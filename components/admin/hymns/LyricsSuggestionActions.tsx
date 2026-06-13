"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, FileText } from "lucide-react"

interface Props {
  hymnId: number
  hymnTitle: string
  lyricsSuggestion: string
  type?: "user" | "ai"
}

export default function LyricsSuggestionActions({ hymnId, hymnTitle, lyricsSuggestion, type = "user" }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null)

  const approveAction = type === "ai" ? "approve-ai-lyrics" : "approve-lyrics"
  const declineAction = type === "ai" ? "decline-ai-lyrics" : "decline-lyrics"

  const handle = async (action: typeof approveAction | typeof declineAction) => {
    const isApprove = action === approveAction
    const msg = isApprove
      ? `Approve ${type === "ai" ? "AI-generated" : ""} lyrics for "${hymnTitle}"? This will replace the current lyrics.`
      : `Decline the ${type === "ai" ? "AI-generated" : ""} lyrics suggestion for "${hymnTitle}"?`
    if (!confirm(msg)) return

    setLoading(isApprove ? "approve" : "decline")
    setOpen(false)
    try {
      await fetch(`/api/hymns/admin/hymns/${hymnId}/${action}`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <FileText className="w-3.5 h-3.5" />
          lyrics
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => handle(approveAction)}
          disabled={loading !== null}
          className="cursor-pointer text-xs font-medium text-success hover:underline disabled:opacity-50"
        >
          approve
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => handle(declineAction)}
          disabled={loading !== null}
          className="cursor-pointer text-xs font-medium text-destructive hover:underline disabled:opacity-50"
        >
          decline
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border bg-popover text-popover-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">Lyrics suggestion</h2>
              <button onClick={() => setOpen(false)} className="cursor-pointer p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="mb-4 text-sm font-medium text-muted-foreground">{hymnTitle}</p>
              <div className="text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: lyricsSuggestion }} />
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button onClick={() => setOpen(false)} className="cursor-pointer rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                Close
              </button>
              <button
                onClick={() => handle(declineAction)}
                disabled={loading !== null}
                className="cursor-pointer rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => handle(approveAction)}
                disabled={loading !== null}
                className="cursor-pointer rounded-lg bg-success px-4 py-2 text-sm text-success-foreground hover:bg-success/90 disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
