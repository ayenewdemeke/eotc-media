import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { getQuestion } from "@/lib/api/quiz"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import { CheckCircle, ArrowLeft } from "lucide-react"

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 border-green-100",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Hard: "bg-red-50 text-red-700 border-red-100",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params
  const questionId = parseInt(id)
  if (!questionId) notFound()

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const question = await getQuestion(questionId)
  if (!question) notFound()

  const choices = question.choices ?? []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl">

              <Link href="/quiz/my-questions" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                My questions
              </Link>

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.approvalStatus && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {question.approvalStatus.name}
                  </span>
                )}
                {question.difficulty && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_COLOR[question.difficulty.name] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {question.difficulty.name}
                  </span>
                )}
                {question.languages?.map(l => (
                  <span key={l.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {l.name}
                  </span>
                ))}
                {question.categories?.map(c => (
                  <span key={c.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {c.name}
                  </span>
                ))}
              </div>

              {/* Question text */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5">
                <div
                  className="text-base font-medium text-slate-900 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />
              </div>

              {/* Choices — correct answer highlighted */}
              <div className="space-y-2">
                {choices.map(choice => (
                  <div
                    key={choice.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
                      choice.isCorrect
                        ? "border-green-300 bg-green-50 text-green-800"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: choice.choiceText }} />
                    {choice.isCorrect && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  </div>
                ))}
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
