"use client"

import { useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Unlink,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  dir?: "ltr" | "rtl" | "auto"
  minHeight?: string
}

function Btn({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        active
          ? "bg-slate-800 text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-slate-200 mx-0.5 self-center" />
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  dir = "ltr",
  minHeight = "140px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL", prev ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}          active={editor.isActive("bold")}          title="Bold">          <Bold          className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}        active={editor.isActive("italic")}        title="Italic">        <Italic        className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}     active={editor.isActive("underline")}     title="Underline">     <UnderlineIcon className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}        active={editor.isActive("strike")}        title="Strikethrough"> <Strikethrough className="w-3.5 h-3.5" /></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()}   active={editor.isActive({ textAlign: "left" })}   title="Align left">   <AlignLeft   className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center"> <AlignCenter className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()}  active={editor.isActive({ textAlign: "right" })}  title="Align right">  <AlignRight  className="w-3.5 h-3.5" /></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")}  title="Bullet list">   <List        className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"> <ListOrdered className="w-3.5 h-3.5" /></Btn>
        <Sep />
        <Btn onClick={setLink} active={editor.isActive("link")} title="Insert link"> <LinkIcon className="w-3.5 h-3.5" /></Btn>
        {editor.isActive("link") && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} active={false} title="Remove link"> <Unlink className="w-3.5 h-3.5" /></Btn>
        )}
      </div>

      {/* Content area */}
      <EditorContent
        editor={editor}
        dir={dir}
        style={{ minHeight }}
        className="rte-content px-3 py-2.5 text-sm text-gray-800 outline-none cursor-text"
      />
    </div>
  )
}
