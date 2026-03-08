"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"
import FavoriteButton from "./FavoriteButton"
import LyricsPanel from "./LyricsPanel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, number>
          events?: {
            onReady?: (event: { target: YTPlayer }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
  interface YTPlayer {
    loadVideoById(videoId: string): void
    cueVideoById(videoId: string): void
    playVideo(): void
  }
}

type SortOrder = "date-desc" | "date-asc" | "clicks-desc" | "clicks-asc"

function sortHymns(hymns: HmHymn[], order: SortOrder): HmHymn[] {
  const copy = [...hymns]
  switch (order) {
    case "date-asc":
      return copy.sort((a, b) => new Date(a.publishedAt ?? a.createdAt).getTime() - new Date(b.publishedAt ?? b.createdAt).getTime())
    case "date-desc":
      return copy.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
    case "clicks-desc":
      return copy.sort((a, b) => b.clicksCount - a.clicksCount)
    case "clicks-asc":
      return copy.sort((a, b) => a.clicksCount - b.clicksCount)
    default:
      return copy
  }
}

interface Props {
  hymns: HmHymn[]
  userId?: number
}

export default function PlayAllPlayer({ hymns: initialHymns, userId }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc")
  const [sortedHymns, setSortedHymns] = useState<HmHymn[]>(() => sortHymns(initialHymns, "date-desc"))
  const [currentHymn, setCurrentHymn] = useState<HmHymn>(initialHymns[0])
  const playerRef = useRef<YTPlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Refs so the YouTube event handler always sees fresh state (avoids stale closure)
  const currentHymnRef = useRef<HmHymn>(initialHymns[0])
  const sortedHymnsRef = useRef<HmHymn[]>(sortHymns(initialHymns, "date-desc"))

  useEffect(() => {
    const sorted = sortHymns(initialHymns, sortOrder)
    setSortedHymns(sorted)
    sortedHymnsRef.current = sorted
  }, [sortOrder, initialHymns])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-active="true"]`)
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [currentHymn])

  const playHymn = (hymn: HmHymn) => {
    setCurrentHymn(hymn)
    currentHymnRef.current = hymn
    fetch(`/api/hymns/${hymn.slug}/click`, { method: "POST" }).catch(() => {})
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(hymn.videoId)
    }
  }

  // Uses refs — no stale closure regardless of when YouTube calls this
  const onPlayerStateChange = (event: { data: number }) => {
    if (event.data === window.YT?.PlayerState?.ENDED) {
      const list = sortedHymnsRef.current
      const index = list.findIndex(h => h.id === currentHymnRef.current.id)
      const next = list[index + 1]
      if (next) playHymn(next)
    }
  }

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new window.YT.Player("yt-play-all-player", {
        videoId: currentHymnRef.current.videoId,
        playerVars: { autoplay: 0, controls: 1 },
        events: {
          onReady: (e) => e.target.cueVideoById(currentHymnRef.current.videoId),
          onStateChange: onPlayerStateChange,
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back link */}
      <Link
        href="/hymns"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hymns
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left: player + metadata + playlist */}
        <div>
          {/* YouTube player */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            <div ref={playerContainerRef} id="yt-play-all-player" className="w-full h-full" />
          </div>

          {/* Title + favorite */}
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="text-lg font-bold text-slate-900 leading-snug">{currentHymn.title}</h1>
            <FavoriteButton
              hymnId={currentHymn.id}
              initialFavorited={currentHymn.isFavorited ?? false}
              userId={userId}
              className="flex-shrink-0 mt-0.5"
            />
          </div>

          {/* Channel */}
          {currentHymn.channel && (
            <div className="mt-2 flex items-center gap-2">
              {currentHymn.channel.thumbnailHigh && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentHymn.channel.thumbnailHigh}
                  alt={currentHymn.channel.title}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              )}
              <Link
                href={`/hymns/channels/${currentHymn.channel.id}`}
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                {currentHymn.channel.title}
              </Link>
            </div>
          )}

          {/* Playlist */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Playlist
                <span className="ml-2 text-xs font-normal text-slate-400">{sortedHymns.length} hymns</span>
              </h2>
              <Select value={sortOrder} onValueChange={v => setSortOrder(v as SortOrder)}>
                <SelectTrigger className="h-7 text-xs w-auto min-w-[140px] border-slate-200 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="clicks-desc">Most Clicked</SelectItem>
                  <SelectItem value="clicks-asc">Least Clicked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              ref={listRef}
              className="border border-slate-100 rounded-xl overflow-y-auto"
              style={{ maxHeight: "28rem" }}
            >
              {sortedHymns.map(hymn => {
                const isActive = hymn.id === currentHymn.id
                return (
                  <div
                    key={hymn.id}
                    data-active={isActive}
                    onClick={() => playHymn(hymn)}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                      isActive
                        ? "bg-blue-50 border-blue-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hymn.thumbnailMedium || hymn.thumbnailDefault}
                        alt={hymn.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug line-clamp-2 ${isActive ? "text-blue-700" : "text-slate-800"}`}>
                        {hymn.title}
                      </p>
                      {hymn.channel && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{hymn.channel.title}</p>
                      )}
                      {isActive && (
                        <p className="text-[10px] text-blue-500 font-semibold mt-0.5">Now Playing</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Lyrics */}
        <aside className="lg:sticky lg:top-[5.5rem] lg:self-start">
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
            <LyricsPanel lyrics={currentHymn.lyrics} />
          </div>
        </aside>
      </div>
    </div>
  )
}
