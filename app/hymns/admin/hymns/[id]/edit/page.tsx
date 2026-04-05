"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface SelectOption { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number }

export default function EditHymnPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [videoId, setVideoId] = useState("")
  const [thumbnailHigh, setThumbnailHigh] = useState("")
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
      fetch(`/api/hymns/admin/hymns/${id}`).then(r => r.json()),
      fetch("/api/hymns/admin/categories").then(r => r.json()),
      fetch("/api/hymns/admin/sub-categories").then(r => r.json()),
      fetch("/api/hymns/admin/singers").then(r => r.json()),
      fetch("/api/hymns/admin/channels").then(r => r.json()),
      fetch("/api/hymns/admin/approval-statuses").then(r => r.json()),
      fetch("/api/hymns/admin/languages").then(r => r.json()),
    ]).then(([hymn, cats, subs, sings, chans, statuses, langs]) => {
      setVideoId(hymn.videoId)
      setThumbnailHigh(hymn.thumbnailHigh)
      setTitle(hymn.title)
      setSinger(hymn.singer ?? "")
      setLyrics(hymn.lyrics ?? "")
      setDescription(hymn.description ?? "")
      setPublishedAt(hymn.publishedAt ? hymn.publishedAt.slice(0, 10) : "")
      setApprovalStatusId(String(hymn.approvalStatusId))
      setChannelId(String(hymn.channelId))
      setSelectedCategoryIds(hymn.categories?.map((c: { category: { id: number } }) => c.category.id) ?? [])
      setSelectedSubCategoryIds(hymn.subCategories?.map((s: { subCategory: { id: number } }) => s.subCategory.id) ?? [])
      setSelectedLanguageIds(hymn.languages?.map((l: { language: { id: number } }) => l.language.id) ?? [])
      setSelectedSingerIds(hymn.singers?.map((s: { singer: { id: number } }) => s.singer.id) ?? [])

      setCategories(cats)
      setSubCategories(subs)
      setSingers(sings)
      setChannels(chans)
      setApprovalStatuses(statuses)
      setLanguages(langs)
      setLoading(false)
    })
  }, [id])

  function toggleId(list: number[], setList: (v: number[]) => void, idVal: number) {
    setList(list.includes(idVal) ? list.filter(x => x !== idVal) : [...list, idVal])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/hymns/admin/hymns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          singer: singer.trim() || null,
          lyrics: lyrics.trim() || null,
          description: description.trim() || null,
          publishedAt: publishedAt || null,
          approvalStatusId,
          channelId,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
          languageIds: selectedLanguageIds,
          singerIds: selectedSingerIds,
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

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit hymn</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail preview */}
        {thumbnailHigh && (
          <div className="flex gap-3 items-start">
            <Image src={thumbnailHigh} alt="thumbnail" width={160} height={90} className="rounded-lg border border-slate-200" unoptimized />
            <p className="text-xs text-slate-500 mt-1">Video ID: <span className="font-mono text-slate-700">{videoId}</span></p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Singer (text)</label>
            <input value={singer} onChange={e => setSinger(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Published date</label>
            <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Approval status</label>
            <select value={approvalStatusId} onChange={e => setApprovalStatusId(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white">
              {approvalStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Channel</label>
            <select value={channelId} onChange={e => setChannelId(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white">
              {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedCategoryIds.includes(cat.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {filteredSubCategories.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sub-categories</label>
            <div className="flex flex-wrap gap-2">
              {filteredSubCategories.map(sc => (
                <button key={sc.id} type="button" onClick={() => toggleId(selectedSubCategoryIds, setSelectedSubCategoryIds, sc.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedSubCategoryIds.includes(sc.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                  {sc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Languages</label>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button key={lang.id} type="button" onClick={() => toggleId(selectedLanguageIds, setSelectedLanguageIds, lang.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedLanguageIds.includes(lang.id) ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Linked singers</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {singers.map(s => (
              <button key={s.id} type="button" onClick={() => toggleId(selectedSingerIds, setSelectedSingerIds, s.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedSingerIds.includes(s.id) ? "bg-slate-700 text-white border-slate-700" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lyrics</label>
          <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={10} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y font-mono" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
