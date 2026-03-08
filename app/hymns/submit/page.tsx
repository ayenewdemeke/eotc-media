"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, CheckCircle, Bold, Italic, Minus, ChevronDown, X } from "lucide-react"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"

interface Language { id: number; name: string }
interface Category { id: number; name: string; languageId?: number | null }
interface SubCategory { id: number; name: string; categoryId: number }

function parseVideoId(input: string): string {
  const s = input.trim()
  try {
    const url = new URL(s)
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0]
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") ?? s
  } catch { /* not a URL — treat as raw ID */ }
  return s
}

function MultiSelect({
  label, required, value, onChange, options, placeholder, disabled,
}: {
  label: string
  required?: boolean
  value: number[]
  onChange: (v: number[]) => void
  options: { id: number; name: string }[]
  placeholder: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  }

  const selectedOptions = options.filter(o => value.includes(o.id))

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => { if (!disabled) setOpen(o => !o) }}
          disabled={disabled}
          className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white text-left flex items-center justify-between disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-colors hover:border-slate-300 focus:outline-none focus:border-blue-400"
        >
          <span className={value.length === 0 ? "text-slate-400" : "text-slate-900"}>
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-52">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-slate-400">No options available</p>
            ) : options.map(opt => (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.id)}
                  onChange={() => toggle(opt.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700">{opt.name}</span>
              </label>
            ))}
          </div>
        )}

        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedOptions.map(opt => (
              <span key={opt.id} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                {opt.name}
                <button type="button" onClick={() => toggle(opt.id)} className="hover:text-blue-900 flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = "w-full h-10 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white transition-colors"

export default function SubmitHymnPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const lyricsRef = useRef<HTMLTextAreaElement>(null)

  const [videoInput, setVideoInput] = useState("")
  const [singer, setSinger] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [description, setDescription] = useState("")
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([])

  const [languages, setLanguages] = useState<Language[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/hymns/admin/languages").then(r => r.json()),
      fetch("/api/hymns/admin/categories").then(r => r.json()),
      fetch("/api/hymns/admin/sub-categories").then(r => r.json()),
    ]).then(([langs, cats, subs]) => {
      setLanguages(langs)
      setAllCategories(cats)
      setAllSubCategories(subs)
    })
  }, [])

  const visibleCategories = selectedLanguageIds.length > 0
    ? allCategories.filter(c => selectedLanguageIds.includes(c.languageId ?? -1))
    : allCategories

  const visibleSubCategories = selectedCategoryIds.length > 0
    ? allSubCategories.filter(sc => selectedCategoryIds.includes(sc.categoryId))
    : []

  function handleLanguageChange(ids: number[]) {
    setSelectedLanguageIds(ids)
    setSelectedCategoryIds([])
    setSelectedSubCategoryIds([])
  }

  function handleCategoryChange(ids: number[]) {
    setSelectedCategoryIds(ids)
    setSelectedSubCategoryIds([])
  }

  function wrapSelection(before: string, after: string) {
    const el = lyricsRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = lyrics.slice(start, end)
    const newText = lyrics.slice(0, start) + before + selected + after + lyrics.slice(end)
    setLyrics(newText)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, end + before.length)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const videoId = parseVideoId(videoInput)
    if (!videoId) { setError("YouTube URL or Video ID is required."); return }
    if (selectedLanguageIds.length === 0) { setError("Please select at least one language."); return }
    if (selectedCategoryIds.length === 0) { setError("Please select at least one category."); return }
    if (selectedSubCategoryIds.length === 0) { setError("Please select at least one sub-category."); return }

    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/hymns/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          singer: singer.trim() || null,
          lyrics: lyrics.trim() || null,
          description: description.trim() || null,
          languageIds: selectedLanguageIds,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
        }),
      })
      if (res.status === 401) { router.push("/auth/login"); return }
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to submit"); return }
      setSubmitted(true)
    } finally {
      setSaving(false)
    }
  }

  const parsedId = parseVideoId(videoInput)
  const showParsedId = videoInput.trim() && parsedId !== videoInput.trim()

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-sm px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Hymn Submitted!</h1>
            <p className="text-slate-500 mb-6">Your hymn has been submitted and is pending review. Thank you!</p>
            <button
              onClick={() => router.push("/hymns/my-hymns")}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              View My Hymns
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />

          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl">
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-900">Add New Hymn</h1>
                <p className="text-sm text-slate-400 mt-0.5">Submit a YouTube hymn for review</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Video + Singer */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Video</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        YouTube URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={videoInput}
                        onChange={e => setVideoInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=…"
                        className={inputCls}
                      />
                      {showParsedId && (
                        <p className="text-xs text-blue-600 mt-1.5">
                          Parsed ID: <span className="font-mono">{parsedId}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Singer/s</label>
                      <input
                        value={singer}
                        onChange={e => setSinger(e.target.value)}
                        placeholder="Singer name (optional)"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </section>

                {/* Cascading Classification */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classification</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MultiSelect
                      label="Language" required
                      value={selectedLanguageIds}
                      onChange={handleLanguageChange}
                      options={languages}
                      placeholder="Select language…"
                    />
                    <MultiSelect
                      label="Category" required
                      value={selectedCategoryIds}
                      onChange={handleCategoryChange}
                      options={visibleCategories}
                      placeholder={selectedLanguageIds.length > 0 ? "Select category…" : "Select language first"}
                      disabled={selectedLanguageIds.length === 0}
                    />
                    <MultiSelect
                      label="Sub-category" required
                      value={selectedSubCategoryIds}
                      onChange={setSelectedSubCategoryIds}
                      options={visibleSubCategories}
                      placeholder={selectedCategoryIds.length > 0 ? "Select sub-category…" : "Select category first"}
                      disabled={selectedCategoryIds.length === 0}
                    />
                  </div>
                </section>

                {/* Lyrics */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lyrics</h2>
                    <div className="flex items-center gap-0.5">
                      <button type="button" title="Bold" onClick={() => wrapSelection("**", "**")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" title="Italic" onClick={() => wrapSelection("_", "_")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3.5 bg-slate-300 mx-1" />
                      <button type="button" title="Verse break" onClick={() => wrapSelection("", "\n\n—\n\n")}
                        className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <textarea
                      ref={lyricsRef}
                      value={lyrics}
                      onChange={e => setLyrics(e.target.value)}
                      rows={10}
                      placeholder="Paste or type hymn lyrics here…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y font-mono leading-relaxed"
                    />
                  </div>
                </section>

                {/* Description */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Description <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </h2>
                  </div>
                  <div className="p-5">
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Optional notes or description…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y"
                    />
                  </div>
                </section>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
                )}

                <div className="flex items-center justify-end gap-3 pb-4">
                  <button
                    type="button"
                    onClick={() => router.push("/hymns/my-hymns")}
                    className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Hymn
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
