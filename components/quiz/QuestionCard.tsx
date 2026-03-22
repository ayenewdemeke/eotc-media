"use client"

import Link from "next/link"
import { QzQuestion } from "@/types/models/quiz"
import { CheckCircle, ChevronRight } from "lucide-react"

interface QuestionCardProps {
  question: QzQuestion
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 border-green-100",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Hard: "bg-red-50 text-red-700 border-red-100",
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const plainText = stripHtml(question.questionText)
  const truncated = plainText.length > 160 ? plainText.slice(0, 160) + "…" : plainText
  const correctCount = question.choices?.filter(c => c.isCorrect).length ?? 0
  const totalChoices = question.choices?.length ?? 0
  const difficulty = question.difficulty?.name
  const diffCls = difficulty ? (DIFFICULTY_COLOR[difficulty] ?? "bg-slate-50 text-slate-600 border-slate-100") : ""
  const categories = question.categories ?? []
  const languages = question.languages ?? []

  return (
    <Link href={`/quiz/${question.id}`} className="group block">
      <div className="h-full bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col gap-3">

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {difficulty && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffCls}`}>
              {difficulty}
            </span>
          )}
          {languages.slice(0, 2).map(l => (
            <span key={l.id} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {l.name}
            </span>
          ))}
          {categories.slice(0, 1).map(c => (
            <span key={c.id} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {c.name}
            </span>
          ))}
        </div>

        {/* Question text */}
        <p className="text-sm font-medium text-slate-800 leading-relaxed flex-1 line-clamp-4">
          {truncated}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>{totalChoices} choices · {correctCount} correct</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Link>
  )
}
