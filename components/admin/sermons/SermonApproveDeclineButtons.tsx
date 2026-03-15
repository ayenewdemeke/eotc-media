"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

interface Props {
  sermonId: number
  sermonTitle: string
}

export default function SermonApproveDeclineButtons({ sermonId, sermonTitle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null)

  const handle = async (action: "approve" | "decline") => {
    const msg =
      action === "approve"
        ? `Accept "${sermonTitle}"?`
        : `Decline "${sermonTitle}"? This will mark it as Rejected.`
    if (!confirm(msg)) return

    setLoading(action)
    try {
      await fetch(`/api/sermons/admin/sermons/${sermonId}/${action}`, { method: "POST" })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handle("approve")}
        disabled={loading !== null}
        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        title="Accept"
      >
        <Check className="w-3.5 h-3.5" />
        Accept
      </button>
      <button
        onClick={() => handle("decline")}
        disabled={loading !== null}
        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        title="Decline"
      >
        <X className="w-3.5 h-3.5" />
        Decline
      </button>
    </div>
  )
}
