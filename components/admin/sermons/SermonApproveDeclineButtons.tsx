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
      <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
        <div className="relative w-full max-w-md rounded-lg border bg-popover text-popover-foreground shadow-xl">
          <div className="border-b px-5 py-4">
            <h4 className="text-base font-medium">{title}</h4>
          </div>
          <div className="px-5 py-4">{body}</div>
          <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
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
      className="cursor-pointer rounded border border-input px-4 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
      Close
    </button>
  )

  const inputClass = "w-full rounded border border-input bg-background px-3 py-1.5 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

  return (
    <>
      {/* ── Three inline table cells ── */}
      <td className="px-4 py-2.5">
        <button onClick={() => openModal("new-preacher")}
          className="cursor-pointer whitespace-nowrap text-xs text-muted-foreground hover:text-foreground hover:underline">
          new preacher
        </button>
      </td>
      <td className="px-4 py-2.5">
        <button onClick={() => openModal("accept")}
          className="cursor-pointer text-xs text-primary hover:underline">
          accept
        </button>
      </td>
      <td className="px-4 py-2.5">
        <button onClick={() => openModal("decline")}
          className="cursor-pointer text-xs text-destructive hover:underline">
          decline
        </button>
      </td>

      {/* ── Accept modal ── */}
      {modal === "accept" && modalShell(
        "Accept sermon",
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Make sure you want to accept this sermon. Also please select the correct preacher(s)
            below — this will greatly help in searching sermons. You can add a new preacher by
            clicking the <em>new preacher</em> link if they are not in the list.
          </p>
          <label className="text-sm font-medium text-foreground">
            Preacher(s) <span className="text-destructive">*</span>
          </label>
          {preachersLoading && (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading preachers…
            </div>
          )}
          {preachersError && <p className="py-2 text-sm text-destructive">{preachersError}</p>}
          {!preachersLoading && !preachersError && (
            <div className="mt-2">
              {selectedIds.length > 0 && (
                <p className="mb-1.5 text-xs text-muted-foreground">
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
                className={`${inputClass} mb-1`}
              />
              <div className="max-h-44 overflow-y-auto rounded border">
                {filtered.length === 0
                  ? <p className="px-3 py-2 text-sm text-muted-foreground">No results</p>
                  : filtered.map(p => (
                    <label key={p.id}
                      className="flex cursor-pointer select-none items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                      <input type="checkbox" checked={selectedIds.includes(p.id)}
                        onChange={() => togglePreacher(p.id)} className="cursor-pointer" />
                      {p.name}
                    </label>
                  ))
                }
              </div>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </>,
        <>
          {closeBtn}
          <button type="button" onClick={handleAccept}
            disabled={loading || preachersLoading}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Accept
          </button>
        </>
      )}

      {/* ── Decline modal ── */}
      {modal === "decline" && modalShell(
        "Decline acceptance",
        <p className="py-3 text-sm text-muted-foreground">
          Are you sure you want to decline accepting this sermon?
        </p>,
        <>
          {closeBtn}
          <button type="button" onClick={handleDecline}
            disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-destructive px-4 py-1.5 text-sm text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Decline
          </button>
        </>
      )}

      {/* ── New Preacher modal ── */}
      {modal === "new-preacher" && modalShell(
        "Add New Preacher",
        <>
          <label htmlFor={`preacher-name-${sermonId}`} className="mb-1 block text-sm text-foreground">
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
            className={inputClass}
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </>,
        <>
          {closeBtn}
          <button type="button" onClick={handleAddPreacher}
            disabled={loading}
            style={{ minWidth: 80 }}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-primary px-5 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add
          </button>
        </>
      )}
    </>
  )
}
