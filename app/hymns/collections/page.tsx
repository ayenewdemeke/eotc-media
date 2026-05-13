"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import { ListMusic, Plus, Edit2, Trash2, Loader2, ChevronRight, Music } from "lucide-react"

interface Collection {
  id: number
  name: string
  hymnCount: number
}

export default function HymnCollectionsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editId !== null) editRef.current?.focus()
  }, [editId])

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return }
    if (status !== "authenticated") return
    fetch("/api/hymns/collections")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCollections(data) })
      .finally(() => setLoading(false))
  }, [status, router])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch("/api/hymns/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (res.ok) {
        const created = await res.json()
        setCollections(prev => [created, ...prev])
        setNewName("")
      }
    } finally {
      setCreating(false)
    }
  }

  async function rename(id: number) {
    if (!editName.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/hymns/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (res.ok) {
        setCollections(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c))
        setEditId(null)
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this list? All saved hymns will be removed.")) return
    await fetch(`/api/hymns/collections/${id}`, { method: "DELETE" })
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <ListMusic className="w-5 h-5 text-slate-700" />
                <h1 className="text-xl font-semibold text-slate-900">My Lists</h1>
              </div>

              {/* Create new list */}
              <form onSubmit={create} className="flex gap-2 mb-6">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="New list name…"
                  className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex items-center gap-1.5 px-4 h-9 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
              </form>

              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Music className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
                  <p className="font-semibold">No lists yet</p>
                  <p className="text-sm mt-1 opacity-60">Create a list to save hymns to it</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {collections.map(col => (
                    <div key={col.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 group">
                      <ListMusic className="w-4 h-4 text-slate-400 flex-shrink-0" />

                      {editId === col.id ? (
                        <input
                          ref={editRef}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") rename(col.id); if (e.key === "Escape") setEditId(null) }}
                          className="flex-1 h-8 px-2 text-sm border border-blue-400 rounded outline-none"
                        />
                      ) : (
                        <Link href={`/hymns/collections/${col.id}`} className="flex-1 min-w-0">
                          <span className="font-medium text-slate-900 text-sm truncate block">{col.name}</span>
                          <span className="text-xs text-slate-400">{col.hymnCount} {col.hymnCount === 1 ? "hymn" : "hymns"}</span>
                        </Link>
                      )}

                      <div className="flex items-center gap-1">
                        {editId === col.id ? (
                          <>
                            <button onClick={() => rename(col.id)} disabled={saving} className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Save</button>
                            <button onClick={() => setEditId(null)} className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-100 cursor-pointer">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditId(col.id); setEditName(col.name) }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => remove(col.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <Link href={`/hymns/collections/${col.id}`} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
