"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Tv, Loader2 } from "lucide-react"

interface Channel {
  id: number
  title: string
  thumbnailDefault: string | null
  thumbnailMedium: string | null
  thumbnailHigh: string | null
  _count: { hymns: number }
}

interface Props {
  initialChannels: Channel[]
  initialTotal: number
  initialTotalPages: number
}

export default function ChannelInfiniteGrid({
  initialChannels,
  initialTotal,
  initialTotalPages,
}: Props) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [page, setPage] = useState(1)
  const [totalPages] = useState(initialTotalPages)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    const nextPage = page + 1
    if (nextPage > totalPages) return

    loadingRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/hymns/channels?page=${nextPage}`)
      if (!res.ok) return
      const data = await res.json()
      setChannels(prev => {
        const seen = new Set(prev.map((c: Channel) => c.id))
        return [...prev, ...(data.channels ?? []).filter((c: Channel) => !seen.has(c.id))]
      })
      setPage(nextPage)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [page, totalPages])

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

  if (channels.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Tv className="w-10 h-10 mb-3 opacity-20" strokeWidth={1.5} />
        <p className="font-semibold text-sm">No channels found</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-5">
        {initialTotal.toLocaleString()} channel{initialTotal !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {channels.map(channel => (
          <Link
            key={channel.id}
            href={`/hymns/channels/${channel.id}`}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors text-center"
          >
            <div className="relative w-14 h-14 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {channel.title.charAt(0).toUpperCase()}
              </span>
              {(channel.thumbnailHigh || channel.thumbnailMedium || channel.thumbnailDefault) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={channel.thumbnailHigh || channel.thumbnailMedium || channel.thumbnailDefault!}
                  alt={channel.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                {channel.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {channel._count.hymns} {channel._count.hymns === 1 ? "hymn" : "hymns"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} className="mt-8" />
      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}
      {!loading && page >= totalPages && channels.length > 0 && (
        <p className="text-center text-xs text-slate-400 py-6">All channels loaded</p>
      )}
    </div>
  )
}
