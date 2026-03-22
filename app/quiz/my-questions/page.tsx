"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import { QzQuestion } from "@/types/models/quiz"
import { Plus, Loader2, HelpCircle, CheckCircle, Clock, XCircle } from "lucide-react"

const STATUS_STYLE: Record<string, { cls: string; icon: React.ReactNode }> = {
  Approved: { cls: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle className="w-3 h-3" /> },
  Submitted: { cls: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: <Clock className="w-3 h-3" /> },
  Declined: { cls: "bg-red-50 text-red-700 border-red-100", icon: <XCircle className="w-3 h-3" /> },
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function MyQuestionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<QzQuestion[]>([])
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return }
    if (status !== "authenticated") return
    fetch("/api/quiz?view=my-questions")
      .then(r => r.ok ? r.json() : { questions: [] })
      .then(data => { setQuestions(data.questions ?? []); setLoading(false) })
  }, [status, router])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">My Questions</h1>
                <p className="text-sm text-slate-400 mt-0.5">Questions you have submitted</p>
              </div>
              <Link href="/quiz/submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                New Question
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <HelpCircle className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
                <p className="font-semibold">No questions yet</p>
                <p className="text-sm mt-1 opacity-60">Submit your first question to get started</p>
                <Link href="/quiz/submit"
                  className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Submit a Question
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map(q => {
                  const statusName = q.approvalStatus?.name ?? "Submitted"
                  const style = STATUS_STYLE[statusName] ?? STATUS_STYLE.Submitted
                  const text = stripHtml(q.questionText)
                  const truncated = text.length > 200 ? text.slice(0, 200) + "…" : text
                  return (
                    <Link key={q.id} href={`/quiz/${q.id}`}
                      className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                      <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">{truncated}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.cls}`}>
                            {style.icon}
                            {statusName}
                          </span>
                          {q.difficulty && (
                            <span className="text-[10px] text-slate-400">{q.difficulty.name}</span>
                          )}
                          {q.categories && q.categories.length > 0 && (
                            <span className="text-[10px] text-slate-400">{q.categories.map(c => c.name).join(", ")}</span>
                          )}
                          <span className="text-[10px] text-slate-400">{q.choices?.length ?? 0} choices</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
