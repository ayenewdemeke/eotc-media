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
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          view
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => handle("approve-description")}
          disabled={loading !== null}
          className="text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50 cursor-pointer"
        >
          approve
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => handle("decline-description")}
          disabled={loading !== null}
          className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 cursor-pointer"
        >
          decline
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Description suggestion</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <p className="text-sm font-medium text-slate-500 mb-4">{sermonTitle}</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{descriptionSuggestion}</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handle("decline-description")}
                disabled={loading !== null}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={() => handle("approve-description")}
                disabled={loading !== null}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
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
