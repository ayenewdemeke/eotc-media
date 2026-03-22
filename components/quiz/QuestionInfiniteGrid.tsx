"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HelpCircle, Loader2 } from "lucide-react"
import { QzQuestion } from "@/types/models/quiz"
import QuestionCard from "./QuestionCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface QuestionInfiniteGridProps {
  initialQuestions: QzQuestion[]
  initialTotal: number
  initialTotalPages: number
  filters: {
    view?: string
    search?: string
    category?: string
    subCategory?: string
    language?: string
    difficulty?: string
  }
}

export default function QuestionInfiniteGrid({
  initialQuestions,
  initialTotal,
  initialTotalPages,
  filters,
}: QuestionInfiniteGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [questions, setQuestions] = useState<QzQuestion[]>(initialQuestions)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setQuestions(initialQuestions)
    setPage(1)
    setTotalPages(initialTotalPages)
  }, [initialQuestions, initialTotalPages])

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    const nextPage = page + 1
    if (nextPage > totalPages) return

    loadingRef.current = true
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(nextPage))
      if (filters.view) params.set("view", filters.view)
      if (filters.search) params.set("search", filters.search)
      if (filters.category) params.set("category", filters.category)
      if (filters.subCategory) params.set("subCategory", filters.subCategory)
      if (filters.language) params.set("language", filters.language)
      if (filters.difficulty) params.set("difficulty", filters.difficulty)

      const res = await fetch(`/api/quiz?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      setQuestions(prev => {
        const seen = new Set(prev.map(q => q.id))
        return [...prev, ...(data.questions ?? []).filter((q: QzQuestion) => !seen.has(q.id))]
      })
      setPage(nextPage)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [page, totalPages, filters])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: "200px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  function applySort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (value === "newest") params.delete("sort")
    else params.set("sort", value)
    router.push(`/quiz?${params.toString()}`)
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <HelpCircle className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
        <p className="font-semibold">No questions found</p>
        <p className="text-sm mt-1 opacity-60">Try a different filter or search term</p>
      </div>
    )
  }

  return (
    <div>
      {initialTotal > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <p className="text-xs text-slate-400">
            {initialTotal.toLocaleString()} question{initialTotal !== 1 ? "s" : ""}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map(q => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
      <div ref={sentinelRef} className="mt-8" />
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}
      {!loading && page >= totalPages && questions.length > 0 && (
        <p className="text-center text-xs text-slate-400 py-6">All questions loaded</p>
      )}
    </div>
  )
}
