"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
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

export default function EditHymnPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [videoId, setVideoId] = useState("")
  const [thumbnailHigh, setThumbnailHigh] = useState("")
  const [title, setTitle] = useState("")
  const [singer, setSinger] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [lyricsSuggestion, setLyricsSuggestion] = useState("")
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
      setLyricsSuggestion(hymn.lyricsSuggestion ?? "")
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
          lyricsSuggestion: lyricsSuggestion.trim() || null,
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

  const chip = "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all"

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
      <PageHeader title="Edit hymn" description="Update hymn details, lyrics and taxonomy." />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {thumbnailHigh && (
              <div className="flex items-start gap-3">
                <Image src={thumbnailHigh} alt="thumbnail" width={160} height={90} className="rounded-lg border" unoptimized />
                <p className="mt-1 text-xs text-muted-foreground">Video ID: <span className="font-mono text-foreground">{videoId}</span></p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Singer (text)</Label>
                <Input value={singer} onChange={e => setSinger(e.target.value)} />
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
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>Lyrics</Label>
              <Textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={10} className="resize-y font-mono" />
            </div>

            <div className="space-y-1.5">
              <Label>Lyrics suggestion</Label>
              <p className="text-xs text-muted-foreground">User-proposed lyrics edit. Approve or decline it from the Lyrics suggestions page.</p>
              <Textarea
                value={lyricsSuggestion}
                onChange={e => setLyricsSuggestion(e.target.value)}
                rows={10}
                className="resize-y font-mono focus-visible:border-warning focus-visible:ring-warning/40"
              />
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
