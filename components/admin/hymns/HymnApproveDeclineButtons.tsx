"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"

interface Singer { id: number; name: string }

interface Props {
  hymnId: number
  hymnTitle: string
}

export default function HymnApproveDeclineButtons({ hymnId, hymnTitle }: Props) {
  const router = useRouter()
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [declineLoading, setDeclareLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [singers, setSingers] = useState<Singer[]>([])
  const [selectedSingerIds, setSelectedSingerIds] = useState<number[]>([])
  const [singersLoaded, setSingersLoaded] = useState(false)
  const [error, setError] = useState("")
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (showAcceptModal) {
      dialogRef.current?.showModal()
      if (!singersLoaded) {
        fetch("/api/hymns/admin/singers")
          .then(r => r.json())
          .then(data => { setSingers(data); setSingersLoaded(true) })
      }
    } else {
      dialogRef.current?.close()
      setSelectedSingerIds([])
      setError("")
    }
  }, [showAcceptModal, singersLoaded])

  function toggleSinger(id: number) {
    setSelectedSingerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleAccept() {
    if (!selectedSingerIds.length) { setError("Please select at least one singer."); return }
    setAcceptLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/hymns/admin/hymns/${hymnId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ singerIds: selectedSingerIds }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Failed to accept hymn")
        return
      }
      setShowAcceptModal(false)
      router.refresh()
    } finally {
      setAcceptLoading(false)
    }
  }

  async function handleDecline() {
    if (!confirm(`Decline "${hymnTitle}"? This will mark it as Declined.`)) return
    setDeclareLoading(true)
    try {
      await fetch(`/api/hymns/admin/hymns/${hymnId}/decline`, { method: "POST" })
      router.refresh()
    } finally {
      setDeclareLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowAcceptModal(true)}
          disabled={declineLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          title="Accept"
        >
          <Check className="w-3.5 h-3.5" />
          Accept
        </button>
        <button
          onClick={handleDecline}
          disabled={declineLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          title="Decline"
        >
          {declineLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          Decline
        </button>
      </div>

      {/* Accept modal — requires singer selection */}
      <dialog
        ref={dialogRef}
        onClose={() => setShowAcceptModal(false)}
        className="rounded-xl shadow-2xl border border-slate-200 p-0 backdrop:bg-black/40 w-full max-w-md"
      >
        <div className="p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Accept hymn</h2>
          <p className="text-sm text-slate-500 mb-4 line-clamp-1">{hymnTitle}</p>

          <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select singer(s) *</p>
          {!singersLoaded ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading singers…
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto mb-1">
              {singers.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSinger(s.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                    selectedSingerIds.includes(s.id)
                      ? "bg-green-600 text-white border-green-600"
                      : "text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleAccept}
              disabled={acceptLoading || !singersLoaded}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {acceptLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm accept
            </button>
            <button
              type="button"
              onClick={() => setShowAcceptModal(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
