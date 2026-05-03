"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Check, X, Loader2, Search } from "lucide-react"

interface Singer { id: number; name: string }

interface Props {
  hymnId: number
  hymnTitle: string
}

export default function HymnApproveDeclineButtons({ hymnId, hymnTitle }: Props) {
  const router = useRouter()
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [declineLoading, setDeclineLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [singers, setSingers] = useState<Singer[]>([])
  const [selectedSingerIds, setSelectedSingerIds] = useState<number[]>([])
  const [singersLoading, setSingersLoading] = useState(false)
  const [singersError, setSingersError] = useState("")
  const [singerSearch, setSingerSearch] = useState("")
  const [error, setError] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showAcceptModal) {
      setSelectedSingerIds([])
      setSingerSearch("")
      setError("")
      return
    }
    setTimeout(() => searchRef.current?.focus(), 50)
    if (singers.length > 0) return
    setSingersLoading(true)
    setSingersError("")
    fetch("/api/hymns/admin/singers")
      .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json() })
      .then(data => setSingers(data))
      .catch(() => setSingersError("Failed to load singers. Please close and try again."))
      .finally(() => setSingersLoading(false))
  }, [showAcceptModal, singers.length])

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
    if (!confirm(`Decline "${hymnTitle}"?`)) return
    setDeclineLoading(true)
    try {
      await fetch(`/api/hymns/admin/hymns/${hymnId}/decline`, { method: "POST" })
      router.refresh()
    } finally {
      setDeclineLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowAcceptModal(true)}
          disabled={declineLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" /> Accept
        </button>
        <button
          onClick={handleDecline}
          disabled={declineLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {declineLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          Decline
        </button>
      </div>

      {showAcceptModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAcceptModal(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Accept hymn</h2>
            <p className="text-sm text-slate-500 mb-5 line-clamp-2">{hymnTitle}</p>

            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Select singer(s) *</p>

            {singersLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading singers…
              </div>
            )}
            {singersError && (
              <p className="text-sm text-red-500 py-2">{singersError}</p>
            )}
            {!singersLoading && !singersError && (
              <>
                {/* Selected chips */}
                {selectedSingerIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedSingerIds.map(id => {
                      const s = singers.find(x => x.id === id)
                      if (!s) return null
                      return (
                        <span key={id} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-full">
                          {s.name}
                          <button type="button" onClick={() => toggleSinger(id)} className="hover:opacity-70 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Search input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={singerSearch}
                    onChange={e => setSingerSearch(e.target.value)}
                    placeholder="Search singers…"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                  />
                </div>

                {/* Filtered list */}
                <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
                  {singers
                    .filter(s => s.name.toLowerCase().includes(singerSearch.toLowerCase()))
                    .map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSinger(s.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          selectedSingerIds.includes(s.id)
                            ? "bg-green-50 text-green-700 font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  {singers.filter(s => s.name.toLowerCase().includes(singerSearch.toLowerCase())).length === 0 && (
                    <p className="text-sm text-slate-400 py-2 px-3">No results</p>
                  )}
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAccept}
                disabled={acceptLoading || singersLoading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {acceptLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm accept
              </button>
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
