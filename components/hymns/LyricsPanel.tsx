"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import {
  Music, Sparkles, Pencil, Plus, X, Check,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Minus, Undo2, Redo2,
} from "lucide-react"

interface LyricsPanelProps {
  lyrics: string | null
  lyricsSuggestion: string | null
  aiLyrics: string | null
  hymnId: number
  userId?: number
}

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1 rounded transition-colors cursor-pointer ${active ? "bg-slate-300 text-slate-900" : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"}`}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-slate-200 bg-slate-50/80">
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <Bold className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <Italic className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <div className="w-px h-4 bg-slate-300 mx-0.5" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        <List className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <div className="w-px h-4 bg-slate-300 mx-0.5" />
      <ToolbarBtn onClick={() => editor.chain().focus().setHardBreak().run()} title="Line break (Shift+Enter)">
        <span className="text-xs font-mono leading-none">↵</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <Minus className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <div className="w-px h-4 bg-slate-300 mx-0.5" />
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo2 className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo2 className="w-3.5 h-3.5" />
      </ToolbarBtn>
    </div>
  )
}

function LyricsEditor({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: string
  onSave: (html: string) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, code: false, blockquote: false }),
      Placeholder.configure({ placeholder: "Enter lyrics… (Shift+Enter = line break within verse, Enter = new verse)" }),
      Underline,
    ],
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: {
        class: "min-h-[220px] px-3 py-2 text-slate-800 text-sm leading-relaxed focus:outline-none font-serif [&_p]:mb-2 [&_hr]:my-2 [&_hr]:border-slate-300",
      },
    },
  })

  const handleSave = useCallback(async () => {
    if (!editor) return
    const html = editor.getHTML()
    if (!editor.getText().trim()) { setError("Please enter lyrics"); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(html)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setSaving(false)
    }
  }, [editor, onSave])

  return (
    <div className="mb-3">
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      <div className="flex items-center justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Check className="w-3 h-3" /> {saving ? "Saving…" : "Submit for review"}
        </button>
      </div>
    </div>
  )
}

export default function LyricsPanel({ lyrics, lyricsSuggestion, aiLyrics, hymnId, userId }: LyricsPanelProps) {
  const [editing, setEditing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [genProgress, setGenProgress] = useState(0)
  const genIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [localSuggestion, setLocalSuggestion] = useState<string | null>(lyricsSuggestion)
  const [localAiLyrics, setLocalAiLyrics] = useState<string | null>(aiLyrics)

  const isLoggedIn = !!userId

  const GEN_STEPS = ["Fetching transcript…", "Reading subtitles…", "Formatting with AI…", "Almost done…"]

  const startProgress = () => {
    setGenStep(0)
    setGenProgress(5)
    let step = 0
    let progress = 5
    genIntervalRef.current = setInterval(() => {
      progress = Math.min(progress + (step < 2 ? 4 : 2), 88)
      if (step < GEN_STEPS.length - 1 && progress > (step + 1) * 22) step++
      setGenProgress(progress)
      setGenStep(step)
    }, 600)
  }

  const stopProgress = () => {
    if (genIntervalRef.current) clearInterval(genIntervalRef.current)
    genIntervalRef.current = null
    setGenProgress(100)
    setTimeout(() => { setGenProgress(0); setGenStep(0) }, 500)
  }

  useEffect(() => () => { if (genIntervalRef.current) clearInterval(genIntervalRef.current) }, [])

  // Save to lyricsSuggestion — aiLyrics is left untouched
  const handleSave = useCallback(async (html: string) => {
    const res = await fetch(`/api/hymns/${hymnId}/suggest-lyrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics: html }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? "Failed to save")
    }
    setLocalSuggestion(html)
    setEditing(false)
  }, [hymnId])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    startProgress()
    try {
      const res = await fetch(`/api/hymns/${hymnId}/generate-lyrics`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate")
      stopProgress()
      setLocalAiLyrics(data.lyrics)
    } catch (e: unknown) {
      stopProgress()
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setGenerating(false)
    }
  }

  // Determine display state
  // Priority: approved lyrics > lyricsSuggestion > aiLyrics > empty
  const allEmpty = !lyrics && !localSuggestion && !localAiLyrics

  // Pre-fill editor: suggestion first (user's last edit), then aiLyrics (as starting point), then approved lyrics
  const editorInitialContent = localSuggestion ?? localAiLyrics ?? lyrics ?? ""

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">ግጥም</h2>
        </div>

        {isLoggedIn && !editing && (
          <div className="flex items-center gap-1.5">
            {/* When all empty: show both Generate + Add */}
            {allEmpty && (
              <>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="relative flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-80 cursor-pointer overflow-hidden"
                >
                  {generating && (
                    <span
                      className="absolute inset-0 bg-blue-200/60 transition-all duration-500 ease-out origin-left"
                      style={{ transform: `scaleX(${genProgress / 100})` }}
                    />
                  )}
                  <span className="relative flex items-center gap-1">
                    {generating ? (
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {generating ? GEN_STEPS[genStep] : "Generate with AI"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setError(null); setEditing(true) }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add lyrics
                </button>
              </>
            )}

            {/* When aiLyrics or suggestion or lyrics exist: show Edit button */}
            {!allEmpty && (
              <button
                type="button"
                onClick={() => { setError(null); setEditing(true) }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {editing && (
        <LyricsEditor
          initialContent={editorInitialContent}
          onSave={handleSave}
          onCancel={() => { setEditing(false); setError(null) }}
        />
      )}

      {!editing && (
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)", scrollbarWidth: "thin" }}>
          {lyrics ? (
            // Approved lyrics
            <div
              className="font-serif text-sm leading-relaxed text-slate-700 [&_p]:mb-2 [&_hr]:my-3 [&_hr]:border-slate-200"
              dangerouslySetInnerHTML={{ __html: lyrics }}
            />
          ) : localSuggestion ? (
            // User suggestion pending review
            <>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />
                Your suggestion is pending admin review
              </div>
              <div
                className="font-serif text-sm leading-relaxed text-slate-600 [&_p]:mb-2 [&_hr]:my-3 [&_hr]:border-slate-200"
                dangerouslySetInnerHTML={{ __html: localSuggestion }}
              />
            </>
          ) : localAiLyrics ? (
            // AI-generated lyrics awaiting user review/edit
            <>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1.5">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                በ AI የተጻፈ፣ እባክዎን "Edit" የሚለውን ተጭነው ጽሁፉን በማስተካከል ያግዙን
              </div>
              <div
                className="font-serif text-sm leading-relaxed text-slate-600 [&_p]:mb-2 [&_hr]:my-3 [&_hr]:border-slate-200"
                dangerouslySetInnerHTML={{ __html: localAiLyrics }}
              />
            </>
          ) : (
            // Truly empty
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Music className="w-8 h-8 mb-2 opacity-20" strokeWidth={1.5} />
              <p className="text-xs font-medium">Lyrics not yet available</p>
              {!isLoggedIn && (
                <p className="text-xs mt-0.5 text-slate-300">Sign in to add or generate lyrics</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
