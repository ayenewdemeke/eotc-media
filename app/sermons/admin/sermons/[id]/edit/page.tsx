"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface SelectOption { id: number; name: string }
interface SubCategory { id: number; name: string; categoryId: number }

const selectClass =
  "w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

function chipClass(active: boolean, variant: "primary" | "secondary" = "primary") {
  if (active)
    return variant === "primary"
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-secondary text-secondary-foreground border-transparent"
  return "text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
}

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
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Edit sermon" description="Update sermon details and taxonomy." />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thumbnail preview */}
            {thumbnailHigh && (
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnailHigh} alt="thumbnail" width={160} height={90} className="rounded-lg border" />
                <p className="mt-1 text-xs text-muted-foreground">Video ID: <span className="font-mono text-foreground">{videoId}</span></p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Preacher (text)</Label>
                <Input value={preacher} onChange={e => setPreacher(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Published date</Label>
                <Input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Approval status</Label>
                <select value={approvalStatusId} onChange={e => setApprovalStatusId(e.target.value)} className={selectClass}>
                  {approvalStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <select value={channelId} onChange={e => setChannelId(e.target.value)} className={selectClass}>
                  <option value="">— No channel —</option>
                  {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                    className={cn("cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all", chipClass(selectedCategoryIds.includes(cat.id)))}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Sub-categories</Label>
                <div className="flex flex-wrap gap-2">
                  {filteredSubCategories.map(sc => (
                    <button key={sc.id} type="button" onClick={() => toggleId(selectedSubCategoryIds, setSelectedSubCategoryIds, sc.id)}
                      className={cn("cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all", chipClass(selectedSubCategoryIds.includes(sc.id)))}>
                      {sc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button key={lang.id} type="button" onClick={() => toggleId(selectedLanguageIds, setSelectedLanguageIds, lang.id)}
                    className={cn("cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all", chipClass(selectedLanguageIds.includes(lang.id)))}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {preachers.length > 0 && (
              <div className="space-y-2">
                <Label>Linked preacher profiles</Label>
                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                  {preachers.map(p => (
                    <button key={p.id} type="button" onClick={() => toggleId(selectedPreacherIds, setSelectedPreacherIds, p.id)}
                      className={cn("cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all", chipClass(selectedPreacherIds.includes(p.id), "secondary"))}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="resize-y" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
