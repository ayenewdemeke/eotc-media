"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Youtube } from "lucide-react"
import Image from "next/image"
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
    return t.trim().replace(/\s+/g, '-').replace(/[^\wሀ-፿-]/g, '').slice(0, 120) + '-' + Date.now().toString(36)
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

  const chip = "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all"

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Add hymn" description="Import a hymn from YouTube and set its taxonomy." />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* YouTube URL */}
            <div className="space-y-1.5">
              <Label>YouTube URL *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                  <Input
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-9"
                  />
                </div>
                <Button type="button" variant="destructive" onClick={fetchYoutube} disabled={fetching || !youtubeUrl.trim()}>
                  {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                </Button>
              </div>
              {fetchError && <p className="text-xs text-destructive">{fetchError}</p>}
              {thumbnailHigh && (
                <div className="mt-3 flex items-start gap-3">
                  <Image src={thumbnailHigh} alt="thumbnail" width={160} height={90} className="rounded-lg border" unoptimized />
                  <div className="text-xs text-muted-foreground">
                    <p>Video ID: <span className="font-mono text-foreground">{videoId}</span></p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Hymn title" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Singer (text)</Label>
                <Input value={singer} onChange={e => setSinger(e.target.value)} placeholder="Singer name…" />
              </div>
              <div className="space-y-1.5">
                <Label>Published date</Label>
                <Input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Approval status *</Label>
                <select value={approvalStatusId} onChange={e => setApprovalStatusId(e.target.value)} className={selectClass}>
                  <option value="">Select…</option>
                  {approvalStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Channel *</Label>
                <select value={channelId} onChange={e => setChannelId(e.target.value)} className={selectClass}>
                  <option value="">Select…</option>
                  {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleId(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                    className={cn(chip, chipClass(selectedCategoryIds.includes(cat.id)))}>
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
                      className={cn(chip, chipClass(selectedSubCategoryIds.includes(sc.id)))}>
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
                    className={cn(chip, chipClass(selectedLanguageIds.includes(lang.id)))}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked singers</Label>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {singers.map(s => (
                  <button key={s.id} type="button" onClick={() => toggleId(selectedSingerIds, setSelectedSingerIds, s.id)}
                    className={cn(chip, chipClass(selectedSingerIds.includes(s.id), "secondary"))}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description…" />
            </div>

            <div className="space-y-1.5">
              <Label>Lyrics</Label>
              <Textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={10} placeholder="Paste lyrics here…" className="resize-y font-mono" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save hymn
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
