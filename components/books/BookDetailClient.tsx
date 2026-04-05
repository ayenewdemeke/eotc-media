"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, ThumbsUp, Flag, MessageSquare, X } from "lucide-react"
import { CbBook, CbBookComment } from "@/types/models/book"

interface BookDetailClientProps {
  book: CbBook & { comments?: CbBookComment[]; hasLiked?: boolean; likesCount?: number; commentsCount?: number }
  userId?: number
}

export default function BookDetailClient({ book, userId }: BookDetailClientProps) {
  const [liked, setLiked] = useState(book.hasLiked ?? false)
  const [likesCount, setLikesCount] = useState(book.likesCount ?? 0)
  const [comments, setComments] = useState<CbBookComment[]>(book.comments ?? [])
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showCopyright, setShowCopyright] = useState(false)
  const [copyrightReason, setCopyrightReason] = useState("")
  const [hasCopyrightReport, setHasCopyrightReport] = useState(false)

  const coverUrl = book.image ? `/api/books/images/${book.image}` : null
  const fileUrl = `/api/books/files/${book.file}`

  async function toggleLike() {
    if (!userId) { window.location.href = "/auth/login"; return }
    const res = await fetch(`/api/books/${book.slug}/like`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      setLiked(data.liked)
      setLikesCount(c => data.liked ? c + 1 : c - 1)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) { window.location.href = "/auth/login"; return }
    if (!commentText.trim()) return
    setSubmittingComment(true)
    const res = await fetch(`/api/books/${book.slug}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: commentText.trim() }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setComments(prev => [...prev, newComment])
      setCommentText("")
    }
    setSubmittingComment(false)
  }

  async function submitCopyright(remove?: boolean) {
    if (!userId) { window.location.href = "/auth/login"; return }
    const res = await fetch(`/api/books/${book.slug}/copyright`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: copyrightReason, remove: remove ?? false }),
    })
    if (res.ok) {
      const data = await res.json()
      setHasCopyrightReport(data.reported)
      setShowCopyright(false)
      setCopyrightReason("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Book info card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          {/* Cover */}
          <div className="flex-shrink-0">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={book.name} className="w-36 sm:w-48 rounded-lg border border-slate-200 object-cover" />
            ) : (
              <div className="w-36 sm:w-48 aspect-[3/4] rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                <Download className="w-10 h-10 text-slate-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-xl font-bold text-slate-900">{book.name}</h1>
            <p className="text-sm text-slate-600">
              {book.authors && book.authors.length > 0
                ? book.authors.map(a => a.name).join(", ")
                : book.author}
            </p>

            <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
              {book.languages && book.languages.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                  {book.languages.map(l => l.name).join(", ")}
                </span>
              )}
              {book.categories && book.categories.length > 0 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {book.categories.map(c => c.name).join(", ")}
                </span>
              )}
              {book.subCategories && book.subCategories.length > 0 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {book.subCategories.map(s => s.name).join(", ")}
                </span>
              )}
            </div>

            {book.description && (
              <p className="text-sm text-slate-600 leading-relaxed pt-1">{book.description}</p>
            )}

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
              <Link href="/books" className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                Back to list
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Like + Copyright */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            liked ? "bg-slate-700 text-white border-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {likesCount}
        </button>

        <button
          onClick={() => setShowCopyright(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            hasCopyrightReport ? "bg-amber-600 text-white border-amber-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Flag className="w-4 h-4" />
          Report copyright
        </button>
      </div>

      {/* Copyright modal */}
      {showCopyright && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Report copyright</h3>
              <button onClick={() => setShowCopyright(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              value={copyrightReason}
              onChange={e => setCopyrightReason(e.target.value)}
              rows={4}
              placeholder="Reason (optional)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              {hasCopyrightReport && (
                <button onClick={() => submitCopyright(true)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Remove Report</button>
              )}
              <button onClick={() => setShowCopyright(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={() => submitCopyright(false)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Comments ({comments.length})</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Add comment */}
          <form onSubmit={submitComment} className="space-y-2">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder={userId ? "Add a comment…" : "Sign in to comment"}
              disabled={!userId}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none disabled:bg-slate-50 disabled:text-slate-400"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim() || !userId}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Comment
              </button>
            </div>
          </form>

          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No comments yet.</p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {comments.map(c => (
                <div key={c.id} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                      {c.user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-900">{c.user?.name ?? "User"}</span>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-line">{c.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
