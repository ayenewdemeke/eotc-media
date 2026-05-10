"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Preacher { id: number; name: string }
interface Props { sermonId: number; sermonTitle: string }

type ModalType = "accept" | "decline" | "new-preacher" | null

export default function SermonApproveDeclineButtons({ sermonId, sermonTitle }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalType>(null)

  // Preacher select state (accept modal)
  const [preachers, setPreachers] = useState<Preacher[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [preachersLoading, setPreachersLoading] = useState(false)
  const [preachersError, setPreachersError] = useState("")

  // New preacher state
  const [newPreacherName, setNewPreacherName] = useState("")

  // Shared
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  function openModal(m: ModalType) {
    setModal(m)
    setError("")
  }

  function closeModal() {
    setModal(null)
    setSelectedIds([])
    setSearch("")
    setNewPreacherName("")
    setError("")
  }

  // Load preachers list when accept modal opens
  useEffect(() => {
    if (modal !== "accept") return
    setTimeout(() => searchRef.current?.focus(), 50)
    if (preachers.length > 0) return
    setPreachersLoading(true)
    setPreachersError("")
    fetch("/api/sermons/admin/preachers")
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setPreachers)
      .catch(() => setPreachersError("Failed to load preachers. Please close and try again."))
      .finally(() => setPreachersLoading(false))
  }, [modal, preachers.length])

  // Focus name input in new preacher modal
  useEffect(() => {
    if (modal === "new-preacher") setTimeout(() => nameRef.current?.focus(), 50)
  }, [modal])

  function togglePreacher(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleAccept() {
    if (!selectedIds.length) { setError("Please select at least one preacher."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/sermons/admin/sermons/${sermonId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preacherIds: selectedIds }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to accept sermon."); return }
      closeModal(); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDecline() {
    setLoading(true)
    try {
      await fetch(`/api/sermons/admin/sermons/${sermonId}/decline`, { method: "POST" })
      closeModal(); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleAddPreacher() {
    if (!newPreacherName.trim()) { setError("Name is required."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/sermons/admin/preachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPreacherName.trim() }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to add preacher."); return }
      const added: Preacher = await res.json()
      setPreachers(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)))
      closeModal()
    } finally { setLoading(false) }
  }

  const filtered = preachers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  // ── Shared modal shell ────────────────────────────────────────────
  function modalShell(title: string, body: React.ReactNode, footer: React.ReactNode) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="text-base font-medium text-slate-800">{title}</h4>
          </div>
          <div className="px-5 py-4">{body}</div>
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // ── Shared buttons ────────────────────────────────────────────────
  const closeBtn = (
    <button type="button" onClick={closeModal}
      className="px-4 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer">
      Close
    </button>
  )

  return (
    <>
      {/* ── Three inline table cells ── */}
      <td className="px-4 py-2.5">
        <button onClick={() => openModal("new-preacher")}
          className="text-xs text-slate-500 hover:text-slate-900 hover:underline cursor-pointer whitespace-nowrap">
          new preacher
        </button>
      </td>
      <td className="px-4 py-2.5">
        <button onClick={() => openModal("accept")}
          className="text-xs text-blue-600 hover:underline cursor-pointer">
          accept
        </button>
      </td>
      <td className="px-4 py-2.5">
        <button onClick={() => openModal("decline")}
          className="text-xs text-red-500 hover:underline cursor-pointer">
          decline
        </button>
      </td>

      {/* ── Accept modal ── */}
      {modal === "accept" && modalShell(
        "Accept sermon",
        <>
          <p className="text-sm text-slate-600 mb-4">
            Make sure you want to accept this sermon. Also please select the correct preacher(s)
            below — this will greatly help in searching sermons. You can add a new preacher by
            clicking the <em>new preacher</em> link if they are not in the list.
          </p>
          <label className="text-sm font-medium text-slate-700">
            Preacher(s) <span className="text-red-500">*</span>
          </label>
          {preachersLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading preachers…
            </div>
          )}
          {preachersError && <p className="text-sm text-red-500 py-2">{preachersError}</p>}
          {!preachersLoading && !preachersError && (
            <div className="mt-2">
              {selectedIds.length > 0 && (
                <p className="text-xs text-slate-500 mb-1.5">
                  {selectedIds.length} selected:{" "}
                  {selectedIds.map(id => preachers.find(p => p.id === id)?.name).filter(Boolean).join(", ")}
                </p>
              )}
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search preachers…"
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded outline-none focus:border-blue-400 mb-1"
              />
              <div className="border border-slate-200 rounded max-h-44 overflow-y-auto">
                {filtered.length === 0
                  ? <p className="text-sm text-slate-400 px-3 py-2">No results</p>
                  : filtered.map(p => (
                    <label key={p.id}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-sm select-none">
                      <input type="checkbox" checked={selectedIds.includes(p.id)}
                        onChange={() => togglePreacher(p.id)} className="cursor-pointer" />
                      {p.name}
                    </label>
                  ))
                }
              </div>
            </div>
          )}
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </>,
        <>
          {closeBtn}
          <button type="button" onClick={handleAccept}
            disabled={loading || preachersLoading}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Accept
          </button>
        </>
      )}

      {/* ── Decline modal ── */}
      {modal === "decline" && modalShell(
        "Decline acceptance",
        <p className="text-sm text-slate-600 py-3">
          Are you sure you want to decline accepting this sermon?
        </p>,
        <>
          {closeBtn}
          <button type="button" onClick={handleDecline}
            disabled={loading}
            className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Decline
          </button>
        </>
      )}

      {/* ── New Preacher modal ── */}
      {modal === "new-preacher" && modalShell(
        "Add New Preacher",
        <>
          <label htmlFor={`preacher-name-${sermonId}`} className="text-sm text-slate-700 block mb-1">
            Preacher name
          </label>
          <input
            ref={nameRef}
            id={`preacher-name-${sermonId}`}
            type="text"
            value={newPreacherName}
            onChange={e => setNewPreacherName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddPreacher()}
            placeholder="Name"
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded outline-none focus:border-blue-400"
          />
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </>,
        <>
          {closeBtn}
          <button type="button" onClick={handleAddPreacher}
            disabled={loading}
            style={{ minWidth: 80 }}
            className="px-5 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add
          </button>
        </>
      )}
    </>
  )
}
