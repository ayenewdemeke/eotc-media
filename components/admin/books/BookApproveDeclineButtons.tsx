"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Props {
  bookId: number
  currentStatus: string
}

export default function BookApproveDeclineButtons({ bookId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null)

  async function handle(action: "approve" | "decline") {
    setLoading(action)
    await fetch(`/api/books/admin/books/${bookId}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
    setLoading(null)
    router.refresh()
  }

  const ghostBtn = "rounded border border-input px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 cursor-pointer"

  if (currentStatus === "Accepted") {
    return (
      <div className="flex gap-1.5">
        <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success">Accepted</span>
        <button onClick={() => handle("decline")} disabled={!!loading} className={ghostBtn}>
          {loading === "decline" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
        </button>
      </div>
    )
  }
  if (currentStatus === "Declined") {
    return (
      <div className="flex gap-1.5">
        <span className="rounded-full bg-destructive/15 px-2 py-1 text-xs font-medium text-destructive">Declined</span>
        <button onClick={() => handle("approve")} disabled={!!loading} className={ghostBtn}>
          {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
        </button>
      </div>
    )
  }
  return (
    <div className="flex gap-1.5">
      <button onClick={() => handle("approve")} disabled={!!loading} className="flex items-center gap-1 rounded bg-success px-2 py-1 text-xs text-success-foreground hover:bg-success/90 disabled:opacity-50 cursor-pointer">
        {loading === "approve" && <Loader2 className="w-3 h-3 animate-spin" />}
        Approve
      </button>
      <button onClick={() => handle("decline")} disabled={!!loading} className="flex items-center gap-1 rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 cursor-pointer">
        {loading === "decline" && <Loader2 className="w-3 h-3 animate-spin" />}
        Decline
      </button>
    </div>
  )
}
