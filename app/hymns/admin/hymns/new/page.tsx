"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Youtube } from "lucide-react"
import Image from "next/image"

interface SelectOption { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number }

export default function NewHymnPage() {
  const router = useRouter()

  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [videoId, setVideoId] = useState("")
  const [thumbnailHigh, setThumbnailHigh] = useState("")
  const [thumbnailDefault, setThumbnailDefault] = useState("")
  const [thumbnailMedium, setThumbnailMedium] = useState("")
  const [thumbnailStandard, setThumbnailStandard] = useState("")
  const [thumbnailMaxres, setThumbnailMaxres] = useState("")

  const [title, setTitle] = useState("")
  const [singer, setSinger] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [description, setDescription] = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [approvalStatusId, setApprovalStatusId] = useState("")
  const [channelId, setChannelId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([])
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])
  const [selectedSingerIds, setSelectedSingerIds] = useState<number[]>([])

  const [categories, setCategories] = useState<SelectOption[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [languages, setLanguages] = useState<SelectOption[]>([])
  const [singers, setSingers] = useState<SelectOption[]>([])
  const [channels, setChannels] = useState<SelectOption[]>([])
  const [approvalStatuses, setApprovalStatuses] = useState<SelectOption[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/hymns/admin/categories").then(r => r.json()),
      fetch("/api/hymns/admin/sub-categories").then(r => r.json()),
      fetch("/api/hymns/admin/singers").then(r => r.json()),
      fetch("/api/hymns/admin/channels").then(r => r.json()),
      fetch("/api/hymns/admin/approval-statuses").then(r => r.json()),
      fetch("/api/hymns/admin/languages").then(r => r.json()),
    ]).then(([cats, subs, sings, chans, statuses, langs]) => {
      setCategories(cats)
      setSubCategories(subs)
      setSingers(sings)
      setChannels(chans)
      setApprovalStatuses(statuses)
      setLanguages(langs)
      // Default to first approval status
      if (statuses.length) setApprovalStatusId(String(statuses[0].id))
    })
  }, [])

  async function fetchYoutube() {
    if (!youtubeUrl.trim()) return
    setFetching(true)
    setFetchError("")
    try {
      const res = await fetch(`/api/hymns/oembed?url=${encodeURIComponent(youtubeUrl)}`)
      if (!res.ok) { setFetchError("Could not fetch YouTube data. Check the URL."); return }
      const data = await res.json()
      setVideoId(data.videoId)
      setTitle(prev => prev || data.title)
      setThumbnailDefault(data.thumbnailDefault)
      setThumbnailMedium(data.thumbnailMedium)
      setThumbnailHigh(data.thumbnailHigh)
      setThumbnailStandard(data.thumbnailStandard)
      setThumbnailMaxres(data.thumbnailMaxres)
    } finally {
      setFetching(false)
    }
  }

  function toggleId(list: number[], setList: (v: number[]) => void, id: number) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  function generateSlug(t: string): string {
    return t.trim().replace(/\s+/g, '-').replace(/[^\w\u1200-\u137F-]/g, '').slice(0, 120) + '-' + Date.now().toString(36)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!videoId || !title.trim() || !approvalStatusId || !channelId) {
      setError("Please fill in all required fields and fetch YouTube data first.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/hymns/admin/hymns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          videoId,
          slug: generateSlug(title),
          approvalStatusId,
          channelId,
          singer: singer.trim() || null,
          lyrics: lyrics.trim() || null,
          description: description.trim() || null,
          publishedAt: publishedAt || null,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
          languageIds: selectedLanguageIds,
          singerIds: selectedSingerIds,
          thumbnailDefault,
          thumbnailMedium,
          thumbnailHigh,
          thumbnailStandard,
          thumbnailMaxres,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save"); return }
      router.push("/hymns/admin/hymns")
    } finally {
      setSaving(false)
    }
  }

  const filteredSubCategories = selectedCategoryIds.length
    ? subCategories.filter(sc => selectedCategoryIds.includes(sc.categoryId))
    : subCategories

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Hymn</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">YouTube URL *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              <input
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
            <button
              type="button"
              onClick={fetchYoutube}
              disabled={fetching || !youtubeUrl.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
            </button>
          </div>
          {fetchError && <p className="text-xs text-red-600 mt-1">{fetchError}</p>}
          {thumbnailHigh && (
            <div className="mt-3 flex gap-3 items-start">
              <Image src={thumbnailHigh} alt="thumbnail" width={160} height={90} className="rounded-lg border border-slate-200" unoptimized />
              <div className="text-xs text-slate-500">
                <p>Video ID: <span className="font-mono text-slate-700">{videoId}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Hymn title"
            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
          />
        </div>

        {/* Singer text + Status + Channel */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Singer (text)</label>
            <input value={singer} onChange={e => setSinger(e.target.value)} placeholder="Singer name…" className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Published Date</label>
            <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Approval Status *</label>
            <select value={approvalStatusId} onChange={e => setApprovalStatusId(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white">
              <option value="">Select…</option>
              {approvalStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Channel *</label>
            <select value={channelId} onChange={e => setChannelId(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white">
              <option value="">Select…</option>
              {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Multi-select: categories */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedCategoryIds.includes(cat.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-categories */}
        {filteredSubCategories.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sub-categories</label>
            <div className="flex flex-wrap gap-2">
              {filteredSubCategories.map(sc => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => toggleId(selectedSubCategoryIds, setSelectedSubCategoryIds, sc.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedSubCategoryIds.includes(sc.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}
                >
                  {sc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Languages</label>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button
                key={lang.id}
                type="button"
                onClick={() => toggleId(selectedLanguageIds, setSelectedLanguageIds, lang.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedLanguageIds.includes(lang.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Singers (linked) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Singers</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {singers.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleId(selectedSingerIds, setSelectedSingerIds, s.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedSingerIds.includes(s.id) ? "bg-slate-700 text-white border-slate-700" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description…" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none" />
        </div>

        {/* Lyrics */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lyrics</label>
          <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={10} placeholder="Paste lyrics here…" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y font-mono" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Hymn
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
