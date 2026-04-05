"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { SmSermon } from "@/types/models/sermon"
import SermonFavoriteButton from "./SermonFavoriteButton"

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, number>
          events?: {
            onReady?: (event: { target: YTSermonPlayer }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YTSermonPlayer
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
  interface YTSermonPlayer {
    loadVideoById(videoId: string): void
    cueVideoById(videoId: string): void
    playVideo(): void
  }
}

type SortOrder = "date-desc" | "date-asc" | "clicks-desc"

function sortSermons(sermons: SmSermon[], order: SortOrder): SmSermon[] {
  const copy = [...sermons]
  switch (order) {
    case "date-asc":
      return copy.sort((a, b) => new Date(a.publishedAt ?? a.createdAt).getTime() - new Date(b.publishedAt ?? b.createdAt).getTime())
    case "date-desc":
      return copy.sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
    case "clicks-desc":
      return copy.sort((a, b) => b.clicksCount - a.clicksCount)
    default:
      return copy
  }
}

const SORT_TABS: { label: string; value: SortOrder }[] = [
  { label: "Newest", value: "date-desc" },
  { label: "Oldest", value: "date-asc" },
  { label: "Popular", value: "clicks-desc" },
]

interface Props {
  sermons: SmSermon[]
  userId?: number
}

export default function SermonPlayAllPlayer({ sermons: initialSermons, userId }: Props) {
  const initialSorted = sortSermons(initialSermons, "date-desc")
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc")
  const [sortedSermons, setSortedSermons] = useState<SmSermon[]>(initialSorted)
  const [currentSermon, setCurrentSermon] = useState<SmSermon>(initialSorted[0])
  const [playerStarted, setPlayerStarted] = useState(false)
  const playerRef = useRef<YTSermonPlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerReadyRef = useRef(false)
  const pendingPlayRef = useRef(false)

  const currentSermonRef = useRef<SmSermon>(initialSorted[0])
  const sortedSermonsRef = useRef<SmSermon[]>(initialSorted)

  useEffect(() => {
    setSortedSermons(sortedSermonsRef.current)
  }, [sortOrder])

  function handleInitialPlay() {
    setPlayerStarted(true)
    if (playerReadyRef.current) {
      playerRef.current?.playVideo()
    } else {
      pendingPlayRef.current = true
    }
  }

  const playSermon = (sermon: SmSermon) => {
    setCurrentSermon(sermon)
    setPlayerStarted(true)
    currentSermonRef.current = sermon
    fetch(`/api/sermons/${sermon.slug}/click`, { method: "POST" }).catch(() => {})
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(sermon.videoId)
    }
  }

  const onPlayerStateChange = (event: { data: number }) => {
    if (event.data === window.YT?.PlayerState?.ENDED) {
      const list = sortedSermonsRef.current
      const index = list.findIndex(s => s.id === currentSermonRef.current.id)
      const next = list[index + 1]
      if (next) playSermon(next)
    }
  }

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new window.YT.Player("yt-play-all-sermon-player", {
        videoId: currentSermonRef.current.videoId,
        playerVars: { autoplay: 0, controls: 1 },
        events: {
          onReady: (e) => {
            playerRef.current = e.target
            playerReadyRef.current = true
            e.target.cueVideoById(currentSermonRef.current.videoId)
            if (pendingPlayRef.current) {
              pendingPlayRef.current = false
              e.target.playVideo()
            }
          },
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
    <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-11 pt-2 pb-8">
      <Link
        href="/sermons"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sermons
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_402px] gap-6 items-start">
        {/* Left: player + metadata + playlist */}
        <div>
          {/* YouTube player with frosted glass overlay before first play */}
          <div className="group relative aspect-video w-full bg-black rounded-xl overflow-hidden">
            <div ref={playerContainerRef} id="yt-play-all-sermon-player" className="w-full h-full" />
            {!playerStarted && (
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={handleInitialPlay}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSermon.thumbnailMaxres || currentSermon.thumbnailStandard || currentSermon.thumbnailHigh || currentSermon.thumbnailMedium || currentSermon.thumbnailDefault}
                  alt={currentSermon.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-200" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/40 transition-all duration-200">
                    <Play className="w-7 h-7 text-white ml-1 drop-shadow" fill="currentColor" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title + favorite */}
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="text-base font-bold text-neutral-900 leading-snug">{currentSermon.title}</h1>
            <SermonFavoriteButton
              sermonId={currentSermon.id}
              initialFavorited={currentSermon.isFavorited ?? false}
              userId={userId}
              className="flex-shrink-0 mt-0.5"
            />
          </div>

          {/* Channel + preachers + clicks */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {currentSermon.channel?.name && (
              <Link href={`/sermons/channels/${currentSermon.channel.id}`} className="flex items-center gap-2">
                {(currentSermon.channel.thumbnailDefault || currentSermon.channel.thumbnailMedium || currentSermon.channel.thumbnailHigh) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentSermon.channel.thumbnailDefault || currentSermon.channel.thumbnailMedium || currentSermon.channel.thumbnailHigh}
                    alt={currentSermon.channel.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-semibold text-neutral-600 flex-shrink-0">
                    {currentSermon.channel.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                  {currentSermon.channel.name}
                </span>
              </Link>
            )}
            {currentSermon.preachers && currentSermon.preachers.length > 0 && (
              <span className="flex items-center gap-1.5 flex-wrap text-sm text-neutral-500">
                {currentSermon.channel?.name && <span className="text-neutral-300">·</span>}
                {currentSermon.preachers.map((p, i) => (
                  <span key={p.id}>
                    <span className="text-neutral-700 font-medium">{p.name}</span>
                    {i < (currentSermon.preachers?.length ?? 0) - 1 && <span className="text-neutral-300">,</span>}
                  </span>
                ))}
              </span>
            )}
            {currentSermon.clicksCount > 0 && (
              <>
                <span className="text-neutral-300 text-sm">·</span>
                <span className="text-xs text-neutral-400">{currentSermon.clicksCount.toLocaleString()} clicks</span>
              </>
            )}
          </div>

          {/* Playlist */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-neutral-900">Playlist</span>
                <span className="text-xs text-neutral-400">{sortedSermons.length}</span>
              </div>
              {/* Sort tabs */}
              <div className="flex items-center gap-0.5">
                {SORT_TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      const sorted = sortSermons(initialSermons, tab.value)
                      sortedSermonsRef.current = sorted
                      setSortOrder(tab.value)
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      sortOrder === tab.value
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl overflow-y-auto border border-neutral-100"
              style={{ maxHeight: "28rem" }}
            >
              {sortedSermons.map(sermon => {
                const isActive = sermon.id === currentSermon.id
                return (
                  <div
                    key={sermon.id}
                    onClick={() => playSermon(sermon)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer border-b border-neutral-50 last:border-0 transition-colors ${
                      isActive ? "bg-neutral-100" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sermon.thumbnailMedium || sermon.thumbnailDefault}
                        alt={sermon.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium leading-snug line-clamp-2 ${isActive ? "text-neutral-900" : "text-neutral-700"}`}>
                        {sermon.title}
                      </p>
                      {sermon.channel && (
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{sermon.channel.name}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: categories + languages */}
        <aside className="lg:sticky lg:top-16 lg:self-start">
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 space-y-4">
            {currentSermon.categories && currentSermon.categories.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {currentSermon.categories.map(c => (
                    <span key={c.id} className="px-2.5 py-1 bg-neutral-200 text-neutral-700 text-xs font-medium rounded-full">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentSermon.languages && currentSermon.languages.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {currentSermon.languages.map(l => (
                    <span key={l.id} className="px-2.5 py-1 bg-neutral-200 text-neutral-600 text-xs font-medium rounded-full">
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(!currentSermon.categories?.length && !currentSermon.languages?.length) && (
              <p className="text-xs text-neutral-400">No metadata available</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
