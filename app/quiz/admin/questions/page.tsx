"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { QzQuestion } from "@/types/models/quiz"
import { CheckCircle, XCircle, Clock, Loader2, Search, Trash2, Eye } from "lucide-react"

const STATUS_STYLE: Record<string, string> = {
  Approved: "bg-green-50 text-green-700 border-green-100",
  Submitted: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Declined: "bg-red-50 text-red-700 border-red-100",
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function AdminQuestionsPage() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")

  const [questions, setQuestions] = useState<QzQuestion[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [approving, setApproving] = useState<number | null>(null)
  const [declining, setDeclining] = useState<number | null>(null)

  async function load(q?: string) {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusParam) params.set("status", statusParam)
    if (q) params.set("search", q)
    const res = await fetch(`/api/quiz/admin/questions?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setTotal(data.total ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [statusParam])

  let debounce: ReturnType<typeof setTimeout>
  function handleSearch(v: string) {
    setSearch(v)
    clearTimeout(debounce)
    debounce = setTimeout(() => load(v), 400)
  }

  async function approve(id: number) {
    setApproving(id)
    await fetch(`/api/quiz/admin/questions/${id}/approve`, { method: "POST" })
    setApproving(null)
    load(search)
  }

  async function decline(id: number) {
    setDeclining(id)
    await fetch(`/api/quiz/admin/questions/${id}/decline`, { method: "POST" })
    setDeclining(null)
    load(search)
  }

  async function remove(id: number) {
    if (!confirm("Delete this question permanently?")) return
    await fetch(`/api/quiz/admin/questions/${id}/delete`, { method: "DELETE" })
    load(search)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {statusParam ? "Pending Questions" : "All Questions"}
          {!loading && <span className="ml-2 text-sm font-normal text-slate-400">({total})</span>}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search questions…"
            className="h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No questions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const statusName = q.approvalStatus?.name ?? "Submitted"
            const statusCls = STATUS_STYLE[statusName] ?? STATUS_STYLE.Submitted
            const text = stripHtml(q.questionText)
            const truncated = text.length > 180 ? text.slice(0, 180) + "…" : text
            const isApproving = approving === q.id
            const isDeclining = declining === q.id

            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCls}`}>
                        {statusName}
                      </span>
                      {q.difficulty && (
                        <span className="text-[10px] text-slate-400">{q.difficulty.name}</span>
                      )}
                      {q.categories?.map(c => (
                        <span key={c.id} className="text-[10px] text-slate-400">{c.name}</span>
                      ))}
                      {q.languages?.map(l => (
                        <span key={l.id} className="text-[10px] text-slate-400">{l.name}</span>
                      ))}
                      <span className="text-[10px] text-slate-400">{q.choices?.length ?? 0} choices</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">{truncated}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/quiz/${q.id}`} target="_blank"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => approve(q.id)} disabled={isApproving || isDeclining}
                      className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md cursor-pointer transition-colors disabled:opacity-50">
                      {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => decline(q.id)} disabled={isApproving || isDeclining}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors disabled:opacity-50">
                      {isDeclining ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => remove(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
