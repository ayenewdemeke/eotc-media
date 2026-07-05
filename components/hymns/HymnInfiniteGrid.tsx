"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Music, Loader2, PlayCircle } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"
import HymnCard from "./HymnCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/lib/i18n/LocaleContext"

interface HymnInfiniteGridProps {
  initialHymns: HmHymn[]
  initialTotal: number
  initialTotalPages: number
  filters: {
    view?: string
    search?: string
    category?: string
    subCategory?: string
    language?: string
    singer?: string
    channel?: string
    collection?: string
    sort?: string
  }
  userId?: number
}

export default function HymnInfiniteGrid({
  initialHymns,
  initialTotal,
  initialTotalPages,
  filters,
  userId,
}: HymnInfiniteGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const activeSort = searchParams.get("sort") ?? "trending"
  const { t } = useLocale()

  const [hymns, setHymns] = useState<HmHymn[]>(initialHymns)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // Reset when filters change (initialHymns prop changes)
  useEffect(() => {
    setHymns(initialHymns)
    setPage(1)
    setTotalPages(initialTotalPages)
  }, [initialHymns, initialTotalPages])

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
      if (filters.singer) params.set("singer", filters.singer)
      if (filters.channel) params.set("channel", filters.channel)
      if (filters.collection) params.set("collection", filters.collection)
      if (filters.sort) params.set("sort", filters.sort)

      const res = await fetch(`/api/hymns?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      setHymns(prev => {
        const seen = new Set(prev.map(h => h.id))
        return [...prev, ...(data.hymns ?? []).filter((h: HmHymn) => !seen.has(h.id))]
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
    if (value === "trending") params.delete("sort")
    else params.set("sort", value)
    // Stay on the current page (main list, singer, channel, favorites,
    // collection…) instead of always jumping back to /hymns.
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function buildPlayAllUrl() {
    const params = new URLSearchParams()
    if (filters.view) params.set("view", filters.view)
    if (filters.language) params.set("language", filters.language)
    if (filters.category) params.set("category", filters.category)
    if (filters.subCategory) params.set("subCategory", filters.subCategory)
    if (filters.singer) params.set("singer", filters.singer)
    if (filters.channel) params.set("channel", filters.channel)
    if (filters.collection) params.set("collection", filters.collection)
    if (filters.search) params.set("search", filters.search)
    if (filters.sort) params.set("sort", filters.sort)
    const q = params.toString()
    return `/hymns/play-all${q ? `?${q}` : ""}`
  }

  if (hymns.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Music className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
        <p className="font-semibold">{t("hymn_none_found")}</p>
        <p className="text-sm mt-1 opacity-60">Try a different filter or search term</p>
      </div>
    )
  }

  return (
    <div>
      {initialTotal > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <p className="text-xs text-slate-400">
            {initialTotal.toLocaleString()} {initialTotal !== 1 ? t("hymn_plural") : t("hymn_singular")}
          </p>
          <span className="text-slate-300 text-xs select-none">|</span>
          <Select value={activeSort} onValueChange={applySort}>
            <SelectTrigger className="h-6 text-xs w-auto min-w-0 bg-transparent border-0 shadow-none px-0 focus:ring-0 text-slate-400 cursor-pointer gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">{t("sort_trending")}</SelectItem>
              <SelectItem value="date-desc">{t("sort_newest_first")}</SelectItem>
              <SelectItem value="date-asc">{t("sort_oldest_first")}</SelectItem>
              <SelectItem value="clicks-desc">{t("sort_most_clicked")}</SelectItem>
              <SelectItem value="clicks-asc">{t("sort_least_clicked")}</SelectItem>
            </SelectContent>
          </Select>
          {initialTotal >= 1 && initialTotal <= 200 && (
            <>
              <span className="text-slate-300 text-xs select-none">|</span>
              <Link
                href={buildPlayAllUrl()}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                {t("hymn_play_all")}
              </Link>
            </>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
        {hymns.map(hymn => (
          <HymnCard key={hymn.id} hymn={hymn} userId={userId} />
        ))}
      </div>
      {/* Sentinel + loading indicator */}
      <div ref={sentinelRef} className="mt-8" />
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}
      {!loading && page >= totalPages && hymns.length > 0 && (
        <p className="text-center text-xs text-slate-400 py-6">{t("hymn_all_loaded")}</p>
      )}
    </div>
  )
}
