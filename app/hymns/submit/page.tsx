"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, CheckCircle } from "lucide-react"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/multi-select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Language { id: number; name: string }
interface Category { id: number; name: string; languageId?: number | null }
interface SubCategory { id: number; name: string; categoryId: number }

function parseVideoId(input: string): string {
  const s = input.trim()
  try {
    const url = new URL(s)
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0]
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") ?? s
  } catch { /* raw ID */ }
  return s
}

export default function SubmitHymnPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

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
  const [editorKey, setEditorKey] = useState(0)

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
          videoId: parseVideoId(videoInput),
          singer: singer.trim() || null,
          lyrics: lyrics || null,
          description: description.trim() || null,
          languageIds: selectedLanguageIds,
          categoryIds: selectedCategoryIds,
          subCategoryIds: selectedSubCategoryIds,
        }),
      })
      if (res.status === 401) { router.push("/auth/login"); return }
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to submit"); return }
      setVideoInput("")
      setSinger("")
      setLyrics("")
      setDescription("")
      setSelectedLanguageIds([])
      setSelectedCategoryIds([])
      setSelectedSubCategoryIds([])
      setEditorKey(k => k + 1)
      setSubmitted(true)
    } finally {
      setSaving(false)
    }
  }

  const parsedId = parseVideoId(videoInput)
  const showParsedId = videoInput.trim() && parsedId !== videoInput.trim()

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto max-w-full lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />

          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-2xl">

              <div className="mb-6">
                <h1 className="text-xl font-semibold">Add new hymn</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">Submit a YouTube hymn for review</p>
              </div>

              {submitted && (
                <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Hymn submitted successfully. It&apos;s pending review — you can submit another one below.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Video */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Video</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="video-url">
                          YouTube URL <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="video-url"
                          value={videoInput}
                          onChange={e => setVideoInput(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=…"
                        />
                        {showParsedId && (
                          <p className="text-xs text-primary">
                            Parsed ID: <span className="font-mono">{parsedId}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="singer">Singer / Artist</Label>
                        <Input
                          id="singer"
                          value={singer}
                          onChange={e => setSinger(e.target.value)}
                          placeholder="Name (optional)"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Classification */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Classification</CardTitle>
                    <CardDescription className="text-xs">Select language first to filter categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <MultiSelect label="Language" required value={selectedLanguageIds}
                        onChange={handleLanguageChange} options={languages} placeholder="Select…" />
                      <MultiSelect label="Category" required value={selectedCategoryIds}
                        onChange={handleCategoryChange} options={visibleCategories}
                        placeholder={selectedLanguageIds.length > 0 ? "Select…" : "Select language first"}
                        disabled={selectedLanguageIds.length === 0} />
                      <MultiSelect label="Sub-category" required value={selectedSubCategoryIds}
                        onChange={setSelectedSubCategoryIds} options={visibleSubCategories}
                        placeholder={selectedCategoryIds.length > 0 ? "Select…" : "Select category first"}
                        disabled={selectedCategoryIds.length === 0} />
                    </div>
                  </CardContent>
                </Card>

                {/* Lyrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Lyrics</CardTitle>
                    <CardDescription className="text-xs">Optional but highly appreciated. Pasted formatting is preserved.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor key={editorKey} value={lyrics} onChange={setLyrics} placeholder="Paste or type hymn lyrics here…" />
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Description</CardTitle>
                    <CardDescription className="text-xs">Optional notes or context</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Optional notes, context, or translation…"
                    />
                  </CardContent>
                </Card>

                {error && (
                  <p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pb-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/hymns/my-hymns")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Submitting…" : "Submit hymn"}
                  </Button>
                </div>

              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
