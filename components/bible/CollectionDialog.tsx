"use client"

import { useState, useEffect } from "react"
import { Plus, Check, Loader2, BookMarked } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { BlCollection } from "@/types/models/bible"

interface CollectionDialogProps {
  open: boolean
  selectedVerseIds: number[]
  selectedVerseNums: number[]
  bookName: string
  chapter: number
  onClose: () => void
}

export default function CollectionDialog({
  open,
  selectedVerseIds,
  selectedVerseNums,
  bookName,
  chapter,
  onClose,
}: CollectionDialogProps) {
  const [collections, setCollections] = useState<BlCollection[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [newName, setNewName] = useState("")
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [creatingNew, setCreatingNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setCheckedIds(new Set())
    setNewName("")
    setLoadingCollections(true)
    fetch("/api/bible/collections")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCollections(data)
      })
      .catch(() => toast.error("Failed to load collections"))
      .finally(() => setLoadingCollections(false))
  }, [open])

  function toggleCollection(id: number) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCreateNew() {
    if (!newName.trim()) return
    setCreatingNew(true)
    try {
      const res = await fetch("/api/bible/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const collection = await res.json()
      if (!res.ok) throw new Error(collection.error)
      setCollections(prev => [collection, ...prev])
      setCheckedIds(prev => new Set([...prev, collection.id]))
      setNewName("")
    } catch {
      toast.error("Failed to create collection")
    } finally {
      setCreatingNew(false)
    }
  }

  async function handleSave() {
    if (checkedIds.size === 0) return
    setSaving(true)
    try {
      await Promise.all(
        [...checkedIds].map(collectionId =>
          fetch(`/api/bible/collections/${collectionId}/verses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verseIds: selectedVerseIds }),
          })
        )
      )
      const count = selectedVerseIds.length
      const collCount = checkedIds.size
      toast.success(
        `${count} verse${count !== 1 ? "s" : ""} saved to ${collCount} collection${collCount !== 1 ? "s" : ""}`
      )
      onClose()
    } catch {
      toast.error("Failed to save verses")
    } finally {
      setSaving(false)
    }
  }

  const verseLabel =
    selectedVerseNums.length === 0
      ? ""
      : selectedVerseNums.length === 1
      ? `${bookName} ${chapter}:${selectedVerseNums[0]}`
      : `${bookName} ${chapter}:${selectedVerseNums[0]}–${selectedVerseNums[selectedVerseNums.length - 1]} (${selectedVerseNums.length} verses)`

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-blue-600" />
            Save to collection
          </DialogTitle>
          {verseLabel && (
            <p className="text-xs text-slate-500 mt-0.5">{verseLabel}</p>
          )}
        </DialogHeader>

        {/* Create new collection inline */}
        <div className="flex gap-2">
          <Input
            placeholder="New collection name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCreateNew() }}
            disabled={creatingNew}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCreateNew}
            disabled={!newName.trim() || creatingNew}
            className="h-8 shrink-0"
          >
            {creatingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Collections list */}
        <div className="border border-slate-100 rounded-lg overflow-hidden">
          {loadingCollections ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">No collections yet.</p>
              <p className="text-xs text-slate-300 mt-0.5">Create one above to get started.</p>
            </div>
          ) : (
            <ul className="max-h-52 overflow-y-auto divide-y divide-slate-50">
              {collections.map(col => (
                <li key={col.id}>
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <Checkbox
                      checked={checkedIds.has(col.id)}
                      onCheckedChange={() => toggleCollection(col.id)}
                      id={`col-${col.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{col.name}</p>
                      {col._count !== undefined && (
                        <p className="text-xs text-slate-400">
                          {col._count.verses} verse{col._count.verses !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    {checkedIds.has(col.id) && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={checkedIds.size === 0 || saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
            Save to {checkedIds.size > 0 ? `${checkedIds.size} collection${checkedIds.size !== 1 ? "s" : ""}` : "collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
