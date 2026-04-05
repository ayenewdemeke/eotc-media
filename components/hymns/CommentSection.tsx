"use client"

import { useState } from "react"
import { MessageCircle, Send } from "lucide-react"
import { HmComment } from "@/types/models/hymn"

interface CommentSectionProps {
  hymnId: number
  comments: HmComment[]
  userId?: number
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return "just now"
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function CommentSection({ hymnId, comments: initial, userId }: CommentSectionProps) {
  const [comments, setComments] = useState<HmComment[]>(initial)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return

    const optimistic: HmComment = {
      id: -Date.now(),
      userId: userId!,
      hymnId,
      comment: text.trim(),
      createdAt: new Date(),
    }
    setComments(prev => [optimistic, ...prev])
    setText("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/hymns/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hymnId, comment: text.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setComments(prev => prev.map(c => (c.id === optimistic.id ? data : c)))
      } else {
        setComments(prev => prev.filter(c => c.id !== optimistic.id))
      }
    } catch {
      setComments(prev => prev.filter(c => c.id !== optimistic.id))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle className="w-5 h-5 text-slate-400" />
        <h2 className="text-base font-bold text-slate-900">
          {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
        </h2>
      </div>

      {/* Comment form */}
      {userId ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="self-end flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-400 mb-6">
          <a href="/auth/login" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
            Sign in
          </a>{" "}
          to leave a comment
        </p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                {comment.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {comment.user?.name ?? "User"}
                  </span>
                  <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
