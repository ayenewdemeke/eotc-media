"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SelectOption { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number }

export default function EditSermonPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [videoId, setVideoId] = useState("")
  const [thumbnailHigh, setThumbnailHigh] = useState("")
  const [title, setTitle] = useState("")
  const [preacher, setPreacher] = useState("")
  const [description, setDescription] = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [approvalStatusId, setApprovalStatusId] = useState("")
  const [channelId, setChannelId] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<number[]>([])
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])
  const [selectedPreacherIds, setSelectedPreacherIds] = useState<number[]>([])

  const [categories, setCategories] = useState<SelectOption[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [languages, setLanguages] = useState<SelectOption[]>([])
  const [preachers, setPreachers] = useState<SelectOption[]>([])
  const [channels, setChannels] = useState<SelectOption[]>([])
  const [approvalStatuses, setApprovalStatuses] = useState<SelectOption[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch(`/api/sermons/admin/sermons/${id}`).then(r => r.json()),
      fetch("/api/sermons/admin/categories").then(r => r.json()),
      fetch("/api/sermons/admin/sub-categories").then(r => r.json()),
      fetch("/api/sermons/admin/preachers").then(r => r.json()),
      fetch("/api/sermons/admin/channels").then(r => r.json()),
      fetch("/api/sermons/admin/approval-statuses").then(r => r.json()),
      fetch("/api/sermons/admin/languages").then(r => r.json()),
    ]).then(([sermon, cats, subs, prs, chans, statuses, langs]) => {
      setVideoId(sermon.videoId ?? "")
      setThumbnailHigh(sermon.thumbnailHigh ?? "")
      setTitle(sermon.title ?? "")
      setPreacher(sermon.preacher ?? "")
      setDescription(sermon.description ?? "")
      setPublishedAt(sermon.publishedAt ? sermon.publishedAt.slice(0, 10) : "")
      setApprovalStatusId(String(sermon.approvalStatusId))
      setChannelId(sermon.channelId ? String(sermon.channelId) : "")
      setSelectedCategoryIds(sermon.categories?.map((c: { category: { id: number } }) => c.category.id) ?? [])
      setSelectedSubCategoryIds(sermon.subCategories?.map((s: { subCategory: { id: number } }) => s.subCategory.id) ?? [])
      setSelectedLanguageIds(sermon.languages?.map((l: { language: { id: number } }) => l.language.id) ?? [])
      setSelectedPreacherIds(sermon.preachers?.map((p: { preacher: { id: number } }) => p.preacher.id) ?? [])

      setCategories(Array.isArray(cats) ? cats : [])
      setSubCategories(Array.isArray(subs) ? subs : [])
      setPreachers(Array.isArray(prs) ? prs : [])
      setChannels(Array.isArray(chans) ? chans : [])
      setApprovalStatuses(Array.isArray(statuses) ? statuses : [])
      setLanguages(Array.isArray(langs) ? langs : [])
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
      const res = await fetch(`/api/sermons/admin/sermons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          preacher: preacher.trim() || null,
          description: description.trim() || null,
          publishedAt: publishedAt || null,
          approvalStatusId,
          channelId: channelId || null,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
          languageIds: selectedLanguageIds,
          preacherIds: selectedPreacherIds,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save"); return }
      router.push("/sermons/admin/sermons")
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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit sermon</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail preview */}
        {thumbnailHigh && (
          <div className="flex gap-3 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailHigh} alt="thumbnail" width={160} height={90} className="rounded-lg border border-slate-200" />
            <p className="text-xs text-slate-500 mt-1">Video ID: <span className="font-mono text-slate-700">{videoId}</span></p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preacher (text)</label>
            <input value={preacher} onChange={e => setPreacher(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
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
              <option value="">— No channel —</option>
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

        {preachers.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked preacher profiles</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {preachers.map(p => (
                <button key={p.id} type="button" onClick={() => toggleId(selectedPreacherIds, setSelectedPreacherIds, p.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${selectedPreacherIds.includes(p.id) ? "bg-slate-700 text-white border-slate-700" : "text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-y" />
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
