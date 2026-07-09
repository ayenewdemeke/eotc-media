"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Loader2, Trash2, AlertTriangle, CheckCircle } from "lucide-react"

type Module = "hymns" | "sermons"

interface Unavailable { id: number; title: string; videoId: string }
interface RefreshResult { total: number; updated: number; unavailable: Unavailable[] }

const btn = "inline-flex items-center gap-1.5 h-9 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

export default function RefreshYoutubeButton({ module }: { module: Module }) {
  const router = useRouter()
  const label = module === "hymns" ? "hymns" : "sermons"

  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [result, setResult] = useState<RefreshResult | null>(null)
  const [deletedMsg, setDeletedMsg] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleRefresh() {
    setRefreshing(true)
    setError("")
    setResult(null)
    setDeletedMsg(null)
    try {
      const res = await fetch(`/api/${module}/admin/${module}/refresh-youtube`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Refresh failed."); return }
      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setRefreshing(false)
    }
  }

  async function handleDelete() {
    if (!result?.unavailable.length) return
    if (!confirm(`Permanently delete ${result.unavailable.length} ${label} whose videos are no longer on YouTube? This cannot be undone.`)) return
    setDeleting(true)
    setError("")
    try {
      const res = await fetch(`/api/${module}/admin/${module}/delete-unavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: result.unavailable.map(u => u.id) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Delete failed."); return }
      setDeletedMsg(
        `Deleted ${data.deleted} ${label}.` +
        (data.skipped ? ` ${data.skipped} were available again and kept.` : "")
      )
      setResult(null)
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={handleRefresh} disabled={refreshing || deleting} className={btn}>
        {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {refreshing ? "Checking YouTube…" : "Update from YouTube"}
      </button>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
      )}

      {deletedMsg && (
        <div className="flex items-center gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {deletedMsg}
        </div>
      )}

      {result && (
        <div className="text-sm rounded-md border border-border bg-muted/40 px-3 py-2.5 space-y-2">
          <p className="text-foreground">
            Checked <strong>{result.total}</strong> · refreshed <strong>{result.updated}</strong>
            {result.updated > 0 && <span className="text-muted-foreground"> (thumbnails / title / date)</span>}
          </p>

          {result.unavailable.length > 0 ? (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span><strong>{result.unavailable.length}</strong> no longer available on YouTube:</span>
              </p>
              <ul className="max-h-48 overflow-y-auto divide-y divide-border rounded-md border border-border bg-background">
                {result.unavailable.map(u => (
                  <li key={u.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <span className="truncate text-foreground">{u.title || "(untitled)"}</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${u.videoId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 text-xs text-muted-foreground hover:underline"
                    >
                      {u.videoId}
                    </a>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 h-9 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting…" : `Delete ${result.unavailable.length} unavailable`}
              </button>
              <p className="text-xs text-muted-foreground">Each video is re-checked before deletion, so any that came back are kept.</p>
            </div>
          ) : (
            <p className="text-muted-foreground">All videos are still available. ✓</p>
          )}
        </div>
      )}
    </div>
  )
}
