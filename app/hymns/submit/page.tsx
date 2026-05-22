"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Loader2, CheckCircle, Music2, Youtube, Bold, Italic,
  Underline as UnderlineIcon, List, Undo2, Redo2, ChevronDown, X,
  Info, FileText, Tag, User,
} from "lucide-react"
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
  } catch { /* raw ID */ }
  return s
}

// ── Toolbar button ────────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      className={`p-1.5 rounded-md text-sm transition-colors disabled:opacity-30 disabled:cursor-default ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  )
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
      attributes: { class: "px-4 py-3 text-sm text-slate-800 leading-relaxed" },
    },
  })

  if (!editor) return null

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <div className="w-px h-4 bg-slate-300 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <Undo2 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <Redo2 className="w-3.5 h-3.5" />
          </ToolbarBtn>
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
              <label key={opt.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={value.includes(opt.id)} onChange={() => toggle(opt.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer" />
                <span className="text-sm text-slate-700">{opt.name}</span>
              </label>
            ))}
          </div>
        )}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selected.map(opt => (
              <span key={opt.id} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                {opt.name}
                <button type="button" onClick={() => toggle(opt.id)} className="hover:text-blue-900">
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

// ── Section card ──────────────────────────────────────────────────────────────

function Section({
  num, icon: Icon, title, children,
}: {
  num: number
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
          {num}
        </div>
        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

const inputCls = "w-full h-10 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white transition-colors"

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
          videoId,
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
  const validId = videoInput.trim() && parsedId.length > 4
  const thumbUrl = validId ? `https://img.youtube.com/vi/${parsedId}/mqdefault.jpg` : null

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-sm px-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Hymn submitted!</h1>
            <p className="text-slate-500 mb-7">Your hymn is pending review. Thank you for your contribution!</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setSubmitted(false); setVideoInput(""); setSinger(""); setLyrics(""); setDescription(""); setSelectedLanguageIds([]); setSelectedCategoryIds([]); setSelectedSubCategoryIds([]) }}
                className="px-5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Submit another
              </button>
              <button
                onClick={() => router.push("/hymns/my-hymns")}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                View my hymns
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />

          <main className="min-w-0">
            {/* Page header */}
            <div className="bg-white border-b border-slate-200">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Add new hymn</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Share a YouTube hymn for review and approval</p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-6 items-start">

                {/* ── Left: form ── */}
                <form onSubmit={handleSubmit} className="space-y-4">

                  <Section num={1} icon={Youtube} title="Video">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          YouTube URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={videoInput}
                          onChange={e => setVideoInput(e.target.value)}
                          placeholder="https://youtube.com/watch?v=…"
                          className={inputCls}
                        />
                        {validId && parsedId !== videoInput.trim() && (
                          <p className="text-xs text-blue-600 mt-1.5">
                            ID: <span className="font-mono">{parsedId}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          <User className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                          Singer / Artist
                        </label>
                        <input
                          value={singer}
                          onChange={e => setSinger(e.target.value)}
                          placeholder="Name (optional)"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </Section>

                  <Section num={2} icon={Tag} title="Classification">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <MultiSelect label="Language" required value={selectedLanguageIds}
                        onChange={handleLanguageChange} options={languages} placeholder="Select language…" />
                      <MultiSelect label="Category" required value={selectedCategoryIds}
                        onChange={handleCategoryChange} options={visibleCategories}
                        placeholder={selectedLanguageIds.length > 0 ? "Select category…" : "Select language first"}
                        disabled={selectedLanguageIds.length === 0} />
                      <MultiSelect label="Sub-category" required value={selectedSubCategoryIds}
                        onChange={setSelectedSubCategoryIds} options={visibleSubCategories}
                        placeholder={selectedCategoryIds.length > 0 ? "Select sub-category…" : "Select category first"}
                        disabled={selectedCategoryIds.length === 0} />
                    </div>
                  </Section>

                  <Section num={3} icon={FileText} title="Lyrics">
                    <LyricsEditor onChange={setLyrics} />
                    <p className="text-xs text-slate-400 mt-2">
                      Optional but highly appreciated. Use <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[11px] font-mono">Enter</kbd> for a new verse, <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[11px] font-mono">Shift+Enter</kbd> for a line break within a verse.
                    </p>
                  </Section>

                  <Section num={4} icon={Info} title="Description (optional)">
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Optional notes, context, or translation…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-y bg-white transition-colors"
                    />
                  </Section>

                  {error && (
                    <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-1 pb-6">
                    <button
                      type="button"
                      onClick={() => router.push("/hymns/my-hymns")}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-7 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-blue-200"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music2 className="w-4 h-4" />}
                      {saving ? "Submitting…" : "Submit hymn"}
                    </button>
                  </div>
                </form>

                {/* ── Right: preview panel ── */}
                <div className="hidden lg:block space-y-4 sticky top-24">
                  {/* YouTube preview */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Video preview</p>
                    </div>
                    <div className="p-3">
                      {thumbUrl ? (
                        <div className="rounded-xl overflow-hidden bg-black aspect-video">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbUrl}
                            alt="YouTube thumbnail"
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.opacity = "0" }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-100 aspect-video flex flex-col items-center justify-center gap-2 text-slate-400">
                          <Youtube className="w-8 h-8 opacity-40" />
                          <p className="text-xs">Paste a YouTube URL above</p>
                        </div>
                      )}
                      {validId && (
                        <p className="text-xs text-slate-400 mt-2 text-center font-mono truncate">{parsedId}</p>
                      )}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2.5">Tips</p>
                    <ul className="space-y-2 text-xs text-amber-800 leading-relaxed">
                      <li className="flex gap-2"><span className="mt-0.5 text-amber-500">•</span>Paste the full YouTube URL or just the video ID</li>
                      <li className="flex gap-2"><span className="mt-0.5 text-amber-500">•</span>Select language first to filter relevant categories</li>
                      <li className="flex gap-2"><span className="mt-0.5 text-amber-500">•</span>Lyrics are optional but greatly improve the hymn page</li>
                      <li className="flex gap-2"><span className="mt-0.5 text-amber-500">•</span>Your submission will be reviewed before it appears publicly</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
