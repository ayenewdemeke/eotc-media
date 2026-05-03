"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Check, X, Loader2, Search } from "lucide-react"

interface Preacher { id: number; name: string }

interface Props {
  sermonId: number
  sermonTitle: string
}

export default function SermonApproveDeclineButtons({ sermonId, sermonTitle }: Props) {
  const router = useRouter()
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [declineLoading, setDeclineLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [preachers, setPreachers] = useState<Preacher[]>([])
  const [selectedPreacherIds, setSelectedPreacherIds] = useState<number[]>([])
  const [preachersLoading, setPreachersLoading] = useState(false)
  const [preachersError, setPreachersError] = useState("")
  const [preacherSearch, setPreacherSearch] = useState("")
  const [error, setError] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showAcceptModal) {
      setSelectedPreacherIds([])
      setPreacherSearch("")
      setError("")
      return
    }
    setTimeout(() => searchRef.current?.focus(), 50)
    if (preachers.length > 0) return
    setPreachersLoading(true)
    setPreachersError("")
    fetch("/api/sermons/admin/preachers")
      .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json() })
      .then(data => setPreachers(data))
      .catch(() => setPreachersError("Failed to load preachers. Please close and try again."))
      .finally(() => setPreachersLoading(false))
  }, [showAcceptModal, preachers.length])

  function togglePreacher(id: number) {
    setSelectedPreacherIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleAccept() {
    if (!selectedPreacherIds.length) { setError("Please select at least one preacher."); return }
    setAcceptLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/sermons/admin/sermons/${sermonId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preacherIds: selectedPreacherIds }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Failed to accept sermon")
        return
      }
      setShowAcceptModal(false)
      router.refresh()
    } finally {
      setAcceptLoading(false)
    }
  }

  async function handleDecline() {
    if (!confirm(`Decline "${sermonTitle}"?`)) return
    setDeclineLoading(true)
    try {
      await fetch(`/api/sermons/admin/sermons/${sermonId}/decline`, { method: "POST" })
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
            <h2 className="text-base font-semibold text-slate-900 mb-1">Accept sermon</h2>
            <p className="text-sm text-slate-500 mb-5 line-clamp-2">{sermonTitle}</p>

            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Select preacher(s) *</p>

            {preachersLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading preachers…
              </div>
            )}
            {preachersError && (
              <p className="text-sm text-red-500 py-2">{preachersError}</p>
            )}
            {!preachersLoading && !preachersError && (
              <>
                {/* Selected chips */}
                {selectedPreacherIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedPreacherIds.map(id => {
                      const p = preachers.find(x => x.id === id)
                      if (!p) return null
                      return (
                        <span key={id} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-full">
                          {p.name}
                          <button type="button" onClick={() => togglePreacher(id)} className="hover:opacity-70 cursor-pointer">
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
                    value={preacherSearch}
                    onChange={e => setPreacherSearch(e.target.value)}
                    placeholder="Search preachers…"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                  />
                </div>

                {/* Filtered list */}
                <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
                  {preachers
                    .filter(p => p.name.toLowerCase().includes(preacherSearch.toLowerCase()))
                    .map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePreacher(p.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          selectedPreacherIds.includes(p.id)
                            ? "bg-green-50 text-green-700 font-medium"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  {preachers.filter(p => p.name.toLowerCase().includes(preacherSearch.toLowerCase())).length === 0 && (
                    <p className="text-sm text-slate-400 py-2 px-3">No results</p>
                  )}
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAccept}
                disabled={acceptLoading || preachersLoading}
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
