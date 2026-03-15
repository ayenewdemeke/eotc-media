"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import BookCard from "./BookCard"
import { CbBook } from "@/types/models/book"

interface BookInfiniteGridProps {
  initialBooks: CbBook[]
  initialTotal: number
  initialTotalPages: number
  filters?: Record<string, string | undefined>
  basePath?: string
}

export default function BookInfiniteGrid({
  initialBooks,
  initialTotal,
  initialTotalPages,
  filters = {},
  basePath = "/books",
}: BookInfiniteGridProps) {
  const [books, setBooks] = useState<CbBook[]>(initialBooks)
  const [page, setPage] = useState(1)
  const [totalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset when filters change
  useEffect(() => {
    setBooks(initialBooks)
    setPage(1)
  }, [initialBooks])

  useEffect(() => {
    if (page === 1) return
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "24")
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })

    setLoading(true)
    fetch(`/api/books?${params}`)
      .then(r => r.json())
      .then(data => { setBooks(prev => [...prev, ...(data.books ?? [])]) })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && page < totalPages) {
        setPage(p => p + 1)
      }
    }, { rootMargin: "200px" })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loading, page, totalPages])

  if (books.length === 0 && !loading) {
    return <p className="text-sm text-slate-400 py-10 text-center">No books found.</p>
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">{initialTotal} book{initialTotal !== 1 ? "s" : ""}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-6">
        {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
      </div>
      <p className="sr-only">{basePath}</p>
    </div>
  )
}
