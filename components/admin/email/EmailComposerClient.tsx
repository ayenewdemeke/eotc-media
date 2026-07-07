"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Send, Users, User, Search, X, CheckCircle, Loader2 } from "lucide-react"
import RichTextEditor from "@/components/admin/shared/RichTextEditor"

interface Member { id: number; name: string; email: string }

type Mode = "all" | "specific"

function hasText(html: string) {
  return html.replace(/<[^>]*>/g, "").trim().length > 0
}

export default function EmailComposerClient() {
  // Default to "specific" so an all-members blast is never a single accidental click
  const [mode, setMode] = useState<Mode>("specific")
  const [subjectAm, setSubjectAm] = useState("")
  const [subjectEn, setSubjectEn] = useState("")
  const [bodyAm, setBodyAm] = useState("")
  const [bodyEn, setBodyEn] = useState("")
  const [editorKey, setEditorKey] = useState(0)

  // Member search / selection
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [selected, setSelected] = useState<Map<number, Member>>(new Map())
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Send state
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number; error?: string } | null>(null)
  const [error, setError] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Total eligible count (for "all" mode)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  useEffect(() => {
    fetch("/api/admin/email/users")
      .then(r => r.json())
      .then((data: Member[]) => setTotalCount(data.length))
      .catch(() => {})
  }, [])

  const searchMembers = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    searchTimer.current = setTimeout(() => {
      fetch(`/api/admin/email/users?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then((data: Member[]) => setSearchResults(data))
        .catch(() => {})
        .finally(() => setSearching(false))
    }, 300)
  }, [])

  function toggleMember(m: Member) {
    setSelected(prev => {
      const next = new Map(prev)
      next.has(m.id) ? next.delete(m.id) : next.set(m.id, m)
      return next
    })
  }

  async function handleSend() {
    setConfirmOpen(false)
    setSending(true)
    setError("")
    setResult(null)
    try {
      const body = {
        subjectAm, subjectEn, bodyAm, bodyEn,
        userIds: mode === "specific" ? [...selected.keys()] : [],
      }
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to send."); return }
      setResult(data)
      // Reset form
      setSubjectAm(""); setSubjectEn(""); setBodyAm(""); setBodyEn("")
      setSelected(new Map()); setQuery(""); setSearchResults([])
      setEditorKey(k => k + 1)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const canSend = subjectAm.trim() && subjectEn.trim() && hasText(bodyAm) && hasText(bodyEn) &&
    (mode === "all" || selected.size > 0)

  const recipientLabel = mode === "all"
    ? `All members${totalCount !== null ? ` (${totalCount})` : ""}`
    : `${selected.size} member${selected.size !== 1 ? "s" : ""} selected`

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email members</h1>
        <p className="text-sm text-gray-500 mt-1">Compose and send emails to your app members in Amharic and English.</p>
      </div>

      <div className="space-y-5">

        {/* Recipients */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Recipients</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              {(["specific", "all"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    mode === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {m === "all" ? <><Users className="w-3.5 h-3.5" /> All members</> : <><User className="w-3.5 h-3.5" /> Specific members</>}
                </button>
              ))}
            </div>

            {mode === "specific" && (
              <div className="space-y-2">
                {selected.size > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {[...selected.values()].map(m => (
                      <span key={m.id} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {m.name}
                        <button onClick={() => toggleMember(m)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={query}
                    onChange={e => { setQuery(e.target.value); searchMembers(e.target.value) }}
                    placeholder="Search by name or email…"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />}
                </div>
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {searchResults.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleMember(m)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${selected.has(m.id) ? "bg-blue-50" : ""}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected.has(m.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                          {selected.has(m.id) && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                          <p className="text-xs text-gray-400 truncate">{m.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400">
              {recipientLabel} · Members who unsubscribed are automatically excluded.
            </p>
          </div>
        </div>

        {/* Amharic section */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">አማርኛ (Amharic)</span>
          </div>
          <div className="p-4 space-y-3">
            <input
              value={subjectAm}
              onChange={e => setSubjectAm(e.target.value)}
              placeholder="ርዕስ (Subject in Amharic)"
              dir="auto"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <RichTextEditor
              key={`am-${editorKey}`}
              value={bodyAm}
              onChange={setBodyAm}
              placeholder="ይዘት (Body in Amharic)"
              dir="auto"
              minHeight="160px"
            />
          </div>
        </div>

        {/* English section */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">English</span>
          </div>
          <div className="p-4 space-y-3">
            <input
              value={subjectEn}
              onChange={e => setSubjectEn(e.target.value)}
              placeholder="Subject in English"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <RichTextEditor
              key={`en-${editorKey}`}
              value={bodyEn}
              onChange={setBodyEn}
              placeholder="Body in English"
              minHeight="160px"
            />
          </div>
        </div>

        {/* Result / error feedback */}
        {result && result.sent > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Email sent successfully</p>
              <p className="text-xs text-green-600 mt-0.5">
                {result.sent} sent · {result.failed} failed · {result.total} total recipients
              </p>
            </div>
          </div>
        )}
        {result && result.sent === 0 && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <p className="font-semibold mb-0.5">Failed to send ({result.failed} failed · {result.total} total recipients)</p>
            {result.error && <p className="text-xs opacity-80">{result.error}</p>}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {/* Send button / confirm */}
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!canSend || sending}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm transition-all"
          >
            <Send className="w-4 h-4" />
            Send Email
          </button>
        ) : (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-800">
              Confirm: send to {recipientLabel}?
            </p>
            <p className="text-xs text-orange-600">This will send an email immediately to all selected recipients. This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Yes, send now"}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-9 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
