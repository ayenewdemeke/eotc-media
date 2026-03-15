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

  if (currentStatus === "Approved") {
    return (
      <div className="flex gap-1.5">
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">Approved</span>
        <button onClick={() => handle("decline")} disabled={!!loading} className="px-2 py-1 text-xs border border-slate-200 text-slate-500 rounded hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
          {loading === "decline" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
        </button>
      </div>
    )
  }
  if (currentStatus === "Rejected") {
    return (
      <div className="flex gap-1.5">
        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">Rejected</span>
        <button onClick={() => handle("approve")} disabled={!!loading} className="px-2 py-1 text-xs border border-slate-200 text-slate-500 rounded hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
          {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
        </button>
      </div>
    )
  }
  return (
    <div className="flex gap-1.5">
      <button onClick={() => handle("approve")} disabled={!!loading} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer flex items-center gap-1">
        {loading === "approve" && <Loader2 className="w-3 h-3 animate-spin" />}
        Approve
      </button>
      <button onClick={() => handle("decline")} disabled={!!loading} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer flex items-center gap-1">
        {loading === "decline" && <Loader2 className="w-3 h-3 animate-spin" />}
        Decline
      </button>
    </div>
  )
}
