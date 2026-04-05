import Link from "next/link"
import { HelpCircle, Plus, ExternalLink } from "lucide-react"
import { QzQuestion } from "@/types/models/quiz"
import Pager from "@/components/ui/Pager"

interface QuizMyListProps {
  questions: QzQuestion[]
  total: number
  page: number
  totalPages: number
  baseUrl: string
}

const statusBadge: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Submitted: "bg-amber-100 text-amber-700",
  Declined: "bg-red-100 text-red-700",
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function QuizMyList({ questions, total, page, totalPages, baseUrl }: QuizMyListProps) {
  const PAGE_SIZE = 24

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My questions</h2>
          <p className="text-xs text-slate-400">{total.toLocaleString()} question{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/quiz/submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Question
        </Link>
      </div>

      <div className="mb-4">
        <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <HelpCircle className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold">No questions yet</p>
          <p className="text-sm mt-1 opacity-60">Submit your first question above</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Question</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Difficulty</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map((q, i) => {
                const statusName = q.approvalStatus?.name ?? "Submitted"
                const text = stripHtml(q.questionText)
                return (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-2.5 text-slate-900 font-medium max-w-[280px] truncate">
                      {text.length > 60 ? text.slice(0, 60) + "…" : text}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">
                      {q.categories && q.categories.length > 0 ? q.categories.map(c => c.name).join(", ") : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{q.difficulty?.name ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[statusName] ?? "bg-slate-100 text-slate-600"}`}>
                        {statusName}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/quiz/${q.id}`} className="text-slate-400 hover:text-slate-700 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />
      </div>
    </div>
  )
}
