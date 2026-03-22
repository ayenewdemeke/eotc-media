"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import { QzQuestion } from "@/types/models/quiz"
import { CheckCircle, XCircle, ArrowLeft, Loader2, RotateCcw } from "lucide-react"

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 border-green-100",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Hard: "bg-red-50 text-red-700 border-red-100",
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [question, setQuestion] = useState<QzQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/quiz/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setQuestion(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  function reset() {
    setSelectedId(null)
    setSubmitted(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
          <p className="text-slate-500">Question not found.</p>
          <Link href="/quiz" className="text-blue-600 hover:underline text-sm">← Back to Quiz</Link>
        </div>
      </div>
    )
  }

  const choices = question.choices ?? []
  const selected = choices.find(c => c.id === selectedId)
  const isCorrect = selected?.isCorrect

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl">

              {/* Back */}
              <Link href="/quiz" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Questions
              </Link>

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.difficulty && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_COLOR[question.difficulty.name] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {question.difficulty.name}
                  </span>
                )}
                {question.type && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {question.type.name}
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
                {question.subCategories?.map(sc => (
                  <span key={sc.id} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                    {sc.name}
                  </span>
                ))}
              </div>

              {/* Question */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                <div
                  className="text-base font-medium text-slate-900 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: question.questionText }}
                />
              </div>

              {/* Choices */}
              <div className="space-y-3 mb-6">
                {choices.map((choice, idx) => {
                  const letter = String.fromCharCode(65 + idx)
                  const isSelected = selectedId === choice.id
                  const showResult = submitted

                  let choiceClass = "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                  if (isSelected && !showResult) choiceClass = "border-blue-500 bg-blue-50 cursor-pointer"
                  if (showResult && choice.isCorrect) choiceClass = "border-green-400 bg-green-50 cursor-default"
                  else if (showResult && isSelected && !choice.isCorrect) choiceClass = "border-red-400 bg-red-50 cursor-default"
                  else if (showResult) choiceClass = "border-slate-200 bg-white opacity-60 cursor-default"

                  return (
                    <button
                      key={choice.id}
                      onClick={() => { if (!submitted) setSelectedId(choice.id) }}
                      disabled={submitted}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left ${choiceClass}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                        showResult && choice.isCorrect ? "bg-green-500 text-white" :
                        showResult && isSelected && !choice.isCorrect ? "bg-red-500 text-white" :
                        isSelected ? "bg-blue-500 text-white" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {letter}
                      </span>
                      <span
                        className="flex-1 text-sm text-slate-800"
                        dangerouslySetInnerHTML={{ __html: choice.choiceText }}
                      />
                      {showResult && choice.isCorrect && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                      {showResult && isSelected && !choice.isCorrect && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {/* Result feedback */}
              {submitted && (
                <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  {isCorrect
                    ? <><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /><span className="text-sm font-medium text-green-800">Correct! Well done.</span></>
                    : <><XCircle className="w-5 h-5 text-red-600 flex-shrink-0" /><span className="text-sm font-medium text-red-800">Incorrect. The correct answer is highlighted in green.</span></>
                  }
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {!submitted ? (
                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={selectedId === null}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
                <Link
                  href="/quiz"
                  className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  All Questions →
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
