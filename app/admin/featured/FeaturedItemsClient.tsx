"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DeleteDialog } from "@/components/admin/shared/DeleteDialog"

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
const MODULE_VARIANT: Record<string, "warning" | "info" | "secondary"> = {
  hymn: "warning",
  sermon: "info",
}

const selectClass =
  "w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

export default function FeaturedItemsClient({ items: initial }: { items: EnrichedItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const [moduleType, setModuleType] = useState<"hymn" | "sermon">("hymn")
  const [itemId, setItemId] = useState("")
  const [name, setName] = useState("")
  const [orderBy, setOrderBy] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<{ id: number; title: string; slug: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [searchQ, setSearchQ] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  async function confirmDelete() {
    if (deleteId == null) return
    setDeleting(true)
    await fetch(`/api/admin/featured/${deleteId}`, { method: "DELETE" })
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleting(false)
    setDeleteId(null)
  }

  return (
    <div className="max-w-3xl space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Featured items"
        description="Featured items appear pinned at the top of the hymns and sermons list pages."
      />

      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add featured item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Module</Label>
                <select
                  value={moduleType}
                  onChange={e => { setModuleType(e.target.value as "hymn" | "sermon"); setItemId(""); setSearchQ(""); setSearchResults([]) }}
                  className={selectClass}
                >
                  <option value="hymn">Hymn</option>
                  <option value="sermon">Sermon</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Display order</Label>
                <Input type="number" value={orderBy} onChange={e => setOrderBy(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div className="relative space-y-1.5">
              <Label className="text-xs">Search {moduleType === "hymn" ? "hymn" : "sermon"}</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={searchQ}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={`Type to search ${moduleType}s…`}
                />
                {searching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
                  {searchResults.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => selectItem(r)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>{r.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">#{r.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Display name (optional override)</Label>
              <Input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Leave blank to use the item title"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button type="submit" disabled={adding || !itemId}>
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current featured items */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Current featured items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {items.length === 0 && (
            <p className="px-5 py-4 text-sm text-muted-foreground">No featured items yet.</p>
          )}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <Badge variant={MODULE_VARIANT[item.moduleType] ?? "secondary"} className="flex-shrink-0">
                {MODULE_LABELS[item.moduleType] ?? item.moduleType}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name || item.resolvedTitle}</p>
                <p className="text-xs text-muted-foreground">ID #{item.itemId} · order {item.orderBy}</p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setDeleteId(item.id)}
                className="flex-shrink-0 text-destructive hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      {isPending && <p className="text-xs text-muted-foreground">Refreshing…</p>}

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Remove featured item"
        description="Are you sure you want to remove this featured item?"
      />
    </div>
  )
}
