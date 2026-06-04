"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, FileText } from "lucide-react"

interface Props {
  sermonId: number
  sermonTitle: string
  descriptionSuggestion: string
}

export default function DescriptionSuggestionActions({ sermonId, sermonTitle, descriptionSuggestion }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null)

  const handle = async (action: "approve-description" | "decline-description") => {
    const msg =
      action === "approve-description"
        ? `Approve description for "${sermonTitle}"? This will replace the current description.`
        : `Decline the description suggestion for "${sermonTitle}"?`
    if (!confirm(msg)) return

    setLoading(action === "approve-description" ? "approve" : "decline")
    setOpen(false)
    try {
      await fetch(`/api/sermons/admin/sermons/${sermonId}/${action}`, { method: "POST" })
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
          view
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => handle("approve-description")}
          disabled={loading !== null}
          className="cursor-pointer text-xs font-medium text-success hover:underline disabled:opacity-50"
        >
          approve
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => handle("decline-description")}
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
              <h2 className="text-base font-semibold">Description suggestion</h2>
              <button onClick={() => setOpen(false)} className="cursor-pointer p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="mb-4 text-sm font-medium text-muted-foreground">{sermonTitle}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{descriptionSuggestion}</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Close
              </button>
              <button
                onClick={() => handle("decline-description")}
                disabled={loading !== null}
                className="cursor-pointer rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => handle("approve-description")}
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
