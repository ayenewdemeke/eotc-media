"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star, Trash2, Plus, Loader2 } from "lucide-react"

interface EnrichedItem {
  id: number
  moduleType: string
  itemId: number
  name: string
  orderBy: number
  resolvedTitle: string
  slug: string
}

const MODULE_LABELS: Record<string, string> = { hymn: "Hymn", sermon: "Sermon" }
const MODULE_COLORS: Record<string, string> = {
  hymn: "bg-amber-100 text-amber-700",
  sermon: "bg-rose-100 text-rose-700",
}

export default function FeaturedItemsClient({ items: initial }: { items: EnrichedItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [isPending, startTransition] = useTransition()

  // Add form state
  const [moduleType, setModuleType] = useState<"hymn" | "sermon">("hymn")
  const [itemId, setItemId] = useState("")
  const [name, setName] = useState("")
  const [orderBy, setOrderBy] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<{ id: number; title: string; slug: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [searchQ, setSearchQ] = useState("")

  async function handleSearch(q: string) {
    setSearchQ(q)
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/${moduleType === "hymn" ? "hymns" : "sermons"}?search=${encodeURIComponent(q)}&limit=8`)
      const data = await res.json()
      const list = (data.hymns ?? data.sermons ?? []) as { id: number; title: string; slug: string }[]
      setSearchResults(list)
    } finally {
      setSearching(false)
    }
  }

  function selectItem(item: { id: number; title: string }) {
    setItemId(String(item.id))
    setName(item.title)
    setSearchQ(item.title)
    setSearchResults([])
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const id = parseInt(itemId)
    if (!id) { setError("Please select a hymn or sermon from the search results"); return }
    setAdding(true)
    try {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleType, itemId: id, name, orderBy: parseInt(orderBy) || 0 }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return }
      setItemId(""); setName(""); setOrderBy(""); setSearchQ(""); setSearchResults([])
      startTransition(() => router.refresh())
    } catch { setError("Something went wrong") }
    finally { setAdding(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this featured item?")) return
    await fetch(`/api/admin/featured/${id}`, { method: "DELETE" })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-neutral-500" />
        <h1 className="text-xl font-bold text-neutral-900">Featured Items</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        Featured items appear pinned at the top of the hymns and sermons list pages.
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 shadow-xs">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Add featured item</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Module</label>
            <select
              value={moduleType}
              onChange={e => { setModuleType(e.target.value as "hymn" | "sermon"); setItemId(""); setSearchQ(""); setSearchResults([]) }}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="hymn">Hymn</option>
              <option value="sermon">Sermon</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Display order</label>
            <input
              type="number"
              value={orderBy}
              onChange={e => setOrderBy(e.target.value)}
              placeholder="0"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Search */}
        <div className="mb-3 relative">
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Search {moduleType === "hymn" ? "hymn" : "sermon"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              placeholder={`Type to search ${moduleType}s…`}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {searching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-neutral-400" />}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
              {searchResults.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectItem(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-neutral-800">{r.title}</span>
                  <span className="text-neutral-400 text-xs ml-2">#{r.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Optional display name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-600 mb-1">Display name (optional override)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Leave blank to use the item title"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={adding || !itemId}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add
        </button>
      </form>

      {/* Current featured items */}
      <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-800">Current featured items ({items.length})</h2>
        </div>
        {items.length === 0 && (
          <p className="px-5 py-4 text-sm text-neutral-400">No featured items yet.</p>
        )}
        <div className="divide-y divide-neutral-50">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${MODULE_COLORS[item.moduleType] ?? "bg-neutral-100 text-neutral-600"}`}>
                {MODULE_LABELS[item.moduleType] ?? item.moduleType}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{item.name || item.resolvedTitle}</p>
                <p className="text-xs text-neutral-400">ID #{item.itemId} · order {item.orderBy}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {isPending && <p className="text-xs text-neutral-400 mt-2">Refreshing…</p>}
    </div>
  )
}
