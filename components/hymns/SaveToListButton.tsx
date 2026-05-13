"use client"

import { useEffect, useRef, useState } from "react"
import { MoreVertical, Heart, ListPlus, Check, Plus, Loader2 } from "lucide-react"

interface CollectionItem {
  id: number
  name: string
  hymnCount: number
  containsHymn: boolean
}

interface SaveToListButtonProps {
  hymnId: number
  userId: number
  initialFavorited?: boolean
}

export default function SaveToListButton({ hymnId, userId, initialFavorited = false }: SaveToListButtonProps) {
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [toggling, setToggling] = useState<number | "fav" | null>(null)
  const [newListMode, setNewListMode] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setNewListMode(false)
        setNewListName("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Focus input when new list mode opens
  useEffect(() => {
    if (newListMode) inputRef.current?.focus()
  }, [newListMode])

  async function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!open) {
      setOpen(true)
      setLoadingCollections(true)
      try {
        const res = await fetch(`/api/hymns/collections?hymnId=${hymnId}`)
        if (res.ok) setCollections(await res.json())
      } finally {
        setLoadingCollections(false)
      }
    } else {
      setOpen(false)
      setNewListMode(false)
      setNewListName("")
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (toggling) return
    setToggling("fav")
    const next = !favorited
    setFavorited(next)
    try {
      const res = await fetch("/api/hymns/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hymnId }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
    } catch {
      setFavorited(!next)
    } finally {
      setToggling(null)
    }
  }

  async function toggleCollection(collection: CollectionItem, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (toggling) return
    setToggling(collection.id)
    const next = !collection.containsHymn
    setCollections(prev => prev.map(c => c.id === collection.id ? { ...c, containsHymn: next } : c))
    try {
      await fetch(`/api/hymns/collections/${collection.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hymnId }),
      })
    } catch {
      setCollections(prev => prev.map(c => c.id === collection.id ? { ...c, containsHymn: !next } : c))
    } finally {
      setToggling(null)
    }
  }

  async function createList(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!newListName.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch("/api/hymns/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      })
      if (res.ok) {
        const created = await res.json()
        // immediately add hymn to new list
        await fetch(`/api/hymns/collections/${created.id}/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hymnId }),
        })
        setCollections(prev => [{ ...created, containsHymn: true }, ...prev])
        setNewListName("")
        setNewListMode(false)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Save to list"
        className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Favorites row */}
          <button
            type="button"
            onClick={toggleFavorite}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 flex-shrink-0 ${favorited ? "text-red-500 fill-red-500" : "text-slate-400"}`}
            />
            <span className="flex-1 truncate">{favorited ? "Remove from Favorites" : "Add to Favorites"}</span>
            {toggling === "fav" && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
          </button>

          <div className="border-t border-slate-100" />

          {/* Collections */}
          {loadingCollections ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {collections.length > 0 && (
                <div className="max-h-44 overflow-y-auto">
                  {collections.map(col => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={e => toggleCollection(col, e)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span className="flex-1 truncate">{col.name}</span>
                      {toggling === col.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                        : col.containsHymn
                          ? <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          : null
                      }
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100">
                {newListMode ? (
                  <form onSubmit={createList} className="flex items-center gap-1.5 px-3 py-2">
                    <input
                      ref={inputRef}
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      placeholder="List name…"
                      className="flex-1 h-7 px-2 text-xs border border-slate-200 rounded outline-none focus:border-blue-400"
                      onClick={e => e.stopPropagation()}
                    />
                    <button
                      type="submit"
                      disabled={!newListName.trim() || creating}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setNewListMode(false); setNewListName("") }}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setNewListMode(true) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    New list
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
