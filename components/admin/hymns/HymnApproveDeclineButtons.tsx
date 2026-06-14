"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Singer { id: number; name: string }
interface Props { hymnId: number; hymnTitle: string }

type ModalType = "accept" | "decline" | "new-singer" | null

export default function HymnApproveDeclineButtons({ hymnId, hymnTitle }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalType>(null)

  // Singer select state (accept modal)
  const [singers, setSingers] = useState<Singer[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [singersLoading, setSingersLoading] = useState(false)
  const [singersError, setSingersError] = useState("")

  // New singer state
  const [newSingerName, setNewSingerName] = useState("")

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
    setNewSingerName("")
    setError("")
  }

  // Load singers list when accept modal opens
  useEffect(() => {
    if (modal !== "accept") return
    setTimeout(() => searchRef.current?.focus(), 50)
    if (singers.length > 0) return
    setSingersLoading(true)
    setSingersError("")
    fetch("/api/hymns/admin/singers")
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setSingers)
      .catch(() => setSingersError("Failed to load singers. Please close and try again."))
      .finally(() => setSingersLoading(false))
  }, [modal, singers.length])

  // Focus name input in new singer modal
  useEffect(() => {
    if (modal === "new-singer") setTimeout(() => nameRef.current?.focus(), 50)
  }, [modal])

  function toggleSinger(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleAccept() {
    if (!selectedIds.length) { setError("Please select at least one singer."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/hymns/admin/hymns/${hymnId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ singerIds: selectedIds }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to accept hymn."); return }
      closeModal(); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleDecline() {
    setLoading(true)
    try {
      await fetch(`/api/hymns/admin/hymns/${hymnId}/decline`, { method: "POST" })
      closeModal(); router.refresh()
    } finally { setLoading(false) }
  }

  async function handleAddSinger() {
    if (!newSingerName.trim()) { setError("Name is required."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/hymns/admin/singers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSingerName.trim() }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to add singer."); return }
      const added: Singer = await res.json()
      setSingers(prev => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)))
      closeModal()
    } finally { setLoading(false) }
  }

  const filtered = singers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

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
        <button onClick={() => openModal("new-singer")}
          className="cursor-pointer whitespace-nowrap text-xs text-muted-foreground hover:text-foreground hover:underline">
          new singer
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
        "Accept hymn",
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Make sure you want to accept this hymn. Also please select the correct singer(s)
            below — this will greatly help in searching hymns. You can add a new singer by
            clicking the <em>new singer</em> link if they are not in the list.
          </p>
          <label className="text-sm font-medium text-foreground">
            Singer/s <span className="text-destructive">*</span>
          </label>
          {singersLoading && (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading singers…
            </div>
          )}
          {singersError && <p className="py-2 text-sm text-destructive">{singersError}</p>}
          {!singersLoading && !singersError && (
            <div className="mt-2">
              {selectedIds.length > 0 && (
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {selectedIds.length} selected:{" "}
                  {selectedIds.map(id => singers.find(s => s.id === id)?.name).filter(Boolean).join(", ")}
                </p>
              )}
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search singers…"
                className={`${inputClass} mb-1`}
              />
              <div className="max-h-44 overflow-y-auto rounded border">
                {filtered.length === 0
                  ? <p className="px-3 py-2 text-sm text-muted-foreground">No results</p>
                  : filtered.map(s => (
                    <label key={s.id}
                      className="flex cursor-pointer select-none items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                      <input type="checkbox" checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSinger(s.id)} className="cursor-pointer" />
                      {s.name}
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
            disabled={loading || singersLoading}
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
          Are you sure you want to decline accepting this hymn?
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

      {/* ── New Singer modal ── */}
      {modal === "new-singer" && modalShell(
        "Add New Singer",
        <>
          <label htmlFor={`singer-name-${hymnId}`} className="mb-1 block text-sm text-foreground">
            Singer name
          </label>
          <input
            ref={nameRef}
            id={`singer-name-${hymnId}`}
            type="text"
            value={newSingerName}
            onChange={e => setNewSingerName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddSinger()}
            placeholder="Name"
            className={inputClass}
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </>,
        <>
          {closeBtn}
          <button type="button" onClick={handleAddSinger}
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
