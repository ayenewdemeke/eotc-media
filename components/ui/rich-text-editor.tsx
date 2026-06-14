"use client"

import { useEffect } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Undo2, Redo2, type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  /** Initial HTML content. */
  value?: string
  /** Emits HTML ("" when empty). */
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

function ToolbarButton({
  icon: Icon, title, onClick, active, disabled,
}: {
  icon: LucideIcon
  title: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // onMouseDown to keep editor selection (prevents blur before command)
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:hover:bg-transparent",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />
}

export function RichTextEditor({
  value = "", onChange, placeholder = "Start typing…", className, minHeight = 240,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // required for Next.js SSR
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, code: false, horizontalRule: false }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap-content px-3.5 py-3 text-sm leading-relaxed outline-none",
        style: `min-height:${minHeight}px`,
      },
    },
  })

  // Keep editor in sync when an external value arrives (e.g. async-loaded edit data).
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) {
    return (
      <div
        className={cn("rounded-md border border-input bg-background", className)}
        style={{ minHeight: minHeight + 41 }}
      />
    )
  }

  return (
    <div className={cn("rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-1.5 py-1">
        <ToolbarButton icon={Bold} title="Bold (Ctrl+B)" active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton icon={Italic} title="Italic (Ctrl+I)" active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton icon={UnderlineIcon} title="Underline (Ctrl+U)" active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton icon={Strikethrough} title="Strikethrough" active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()} />
        <Divider />
        <ToolbarButton icon={List} title="Bullet list" active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} title="Numbered list" active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton icon={Quote} title="Quote" active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton icon={Undo2} title="Undo" disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()} />
          <ToolbarButton icon={Redo2} title="Redo" disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()} />
        </div>
      </div>
      <EditorContent editor={editor as Editor} />
    </div>
  )
}
