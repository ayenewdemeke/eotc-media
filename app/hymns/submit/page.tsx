"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Loader2, CheckCircle, Bold, Italic, Underline as UnderlineIcon,
  List, Undo2, Redo2, ChevronDown, X,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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

// ── TipTap lyrics editor ──────────────────────────────────────────────────────

function LyricsEditor({ onChange }: { onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, codeBlock: false, code: false }),
      Underline,
      Placeholder.configure({ placeholder: "Paste or type hymn lyrics here…" }),
    ],
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: { class: "px-3 py-2.5 text-sm text-foreground leading-relaxed min-h-[200px] outline-none" },
    },
  })

  if (!editor) return null

  return (
    <div className="rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-input bg-muted/40 flex-wrap">
        <Button
          type="button" variant="ghost" size="icon"
          className="h-7 w-7"
          title="Bold (Ctrl+B)"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          data-active={editor.isActive("bold") || undefined}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon"
          className="h-7 w-7"
          title="Italic (Ctrl+I)"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          data-active={editor.isActive("italic") || undefined}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon"
          className="h-7 w-7"
          title="Underline (Ctrl+U)"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
          data-active={editor.isActive("underline") || undefined}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <Button
          type="button" variant="ghost" size="icon"
          className="h-7 w-7"
          title="Bullet list"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
          data-active={editor.isActive("bulletList") || undefined}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7"
            title="Undo"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().undo().run() }}
            disabled={!editor.can().undo()}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7"
            title="Redo"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().redo().run() }}
            disabled={!editor.can().redo()}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

// ── Multi-select ──────────────────────────────────────────────────────────────

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

  const selected = options.filter(o => value.includes(o.id))

  return (
    <div className="space-y-1.5">
      <Label>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => { if (!disabled) setOpen(o => !o) }}
          disabled={disabled}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={value.length === 0 ? "text-muted-foreground" : ""}>
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute z-20 top-full mt-1 w-full rounded-md border border-input bg-popover shadow-md overflow-y-auto max-h-52">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">No options available</p>
            ) : options.map(opt => (
              <label key={opt.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent cursor-pointer">
                <input type="checkbox" checked={value.includes(opt.id)} onChange={() => toggle(opt.id)}
                  className="h-4 w-4 rounded border-input" />
                <span className="text-sm">{opt.name}</span>
              </label>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selected.map(opt => (
              <span key={opt.id} className="inline-flex items-center gap-1 rounded-full border border-input bg-muted px-2.5 py-0.5 text-xs font-medium">
                {opt.name}
                <button type="button" onClick={() => toggle(opt.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
      setSubmitted(true)
    } finally {
      setSaving(false)
    }
  }

  const parsedId = parseVideoId(videoInput)
  const showParsedId = videoInput.trim() && parsedId !== videoInput.trim()

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-sm px-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Hymn submitted!</h1>
            <p className="text-muted-foreground mb-6">Your hymn has been submitted and is pending review. Thank you!</p>
            <Button onClick={() => router.push("/hymns/my-hymns")}>View my hymns</Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />

          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl">

              <div className="mb-6">
                <h1 className="text-xl font-semibold">Add new hymn</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Submit a YouTube hymn for review</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Video */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Video</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <p className="text-xs text-blue-600">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <CardDescription className="text-xs">Optional but highly appreciated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LyricsEditor onChange={setLyrics} />
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
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-2.5">
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
