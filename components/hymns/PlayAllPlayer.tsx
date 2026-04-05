"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"
import FavoriteButton from "./FavoriteButton"
import LyricsPanel from "./LyricsPanel"

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

type SortOrder = "date-desc" | "date-asc" | "clicks-desc"

function sortHymns(hymns: HmHymn[], order: SortOrder): HmHymn[] {
  const copy = [...hymns]
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
  hymns: HmHymn[]
  userId?: number
}

export default function PlayAllPlayer({ hymns: initialHymns, userId }: Props) {
  const initialSorted = sortHymns(initialHymns, "date-desc")
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc")
  const [sortedHymns, setSortedHymns] = useState<HmHymn[]>(initialSorted)
  const [currentHymn, setCurrentHymn] = useState<HmHymn>(initialSorted[0])
  const [playerStarted, setPlayerStarted] = useState(false)
  const playerRef = useRef<YTPlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerReadyRef = useRef(false)
  const pendingPlayRef = useRef(false)

  const currentHymnRef = useRef<HmHymn>(initialSorted[0])
  const sortedHymnsRef = useRef<HmHymn[]>(initialSorted)

  useEffect(() => {
    setSortedHymns(sortedHymnsRef.current)
  }, [sortOrder])

  function handleInitialPlay() {
    setPlayerStarted(true)
    if (playerReadyRef.current) {
      playerRef.current?.playVideo()
    } else {
      // Player not ready yet — queue it; onReady will pick it up
      pendingPlayRef.current = true
    }
  }

  const playHymn = (hymn: HmHymn) => {
    setCurrentHymn(hymn)
    setPlayerStarted(true)
    currentHymnRef.current = hymn
    fetch(`/api/hymns/${hymn.slug}/click`, { method: "POST" }).catch(() => {})
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(hymn.videoId)
    }
  }

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
          onReady: (e) => {
            playerRef.current = e.target  // use the real player object, not the shell
            playerReadyRef.current = true
            e.target.cueVideoById(currentHymnRef.current.videoId)
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
        href="/hymns"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Hymns
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_402px] gap-6 items-start">
        {/* Left: player + metadata + playlist */}
        <div>
          {/* YouTube player with frosted glass overlay before first play */}
          <div className="group relative aspect-video w-full bg-black rounded-xl overflow-hidden">
            <div ref={playerContainerRef} id="yt-play-all-player" className="w-full h-full" />
            {!playerStarted && (
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={handleInitialPlay}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentHymn.thumbnailMaxres || currentHymn.thumbnailStandard || currentHymn.thumbnailHigh || currentHymn.thumbnailMedium || currentHymn.thumbnailDefault}
                  alt={currentHymn.title}
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
            <h1 className="text-base font-bold text-neutral-900 leading-snug">{currentHymn.title}</h1>
            <FavoriteButton
              hymnId={currentHymn.id}
              initialFavorited={currentHymn.isFavorited ?? false}
              userId={userId}
              className="flex-shrink-0 mt-0.5"
            />
          </div>

          {/* Channel + singers + clicks */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {currentHymn.channel?.title && (
              <Link href={`/hymns/channels/${currentHymn.channel.id}`} className="flex items-center gap-2">
                {(currentHymn.channel.thumbnailDefault || currentHymn.channel.thumbnailMedium || currentHymn.channel.thumbnailHigh) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentHymn.channel.thumbnailDefault || currentHymn.channel.thumbnailMedium || currentHymn.channel.thumbnailHigh}
                    alt={currentHymn.channel.title}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-semibold text-neutral-600 flex-shrink-0">
                    {currentHymn.channel.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                  {currentHymn.channel.title}
                </span>
              </Link>
            )}
            {currentHymn.singers && currentHymn.singers.length > 0 && (
              <span className="flex items-center gap-1.5 flex-wrap text-sm text-neutral-500">
                {currentHymn.channel?.title && <span className="text-neutral-300">·</span>}
                {currentHymn.singers.map((s, i) => (
                  <span key={s.id}>
                    <Link href={`/hymns/singer/${s.id}`} className="hover:text-neutral-800 transition-colors">
                      {s.name}
                    </Link>
                    {i < (currentHymn.singers?.length ?? 0) - 1 && <span className="text-neutral-300">,</span>}
                  </span>
                ))}
              </span>
            )}
            {currentHymn.clicksCount > 0 && (
              <>
                <span className="text-neutral-300 text-sm">·</span>
                <span className="text-xs text-neutral-400">{currentHymn.clicksCount.toLocaleString()} clicks</span>
              </>
            )}
          </div>

          {/* Playlist */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-neutral-900">Playlist</span>
                <span className="text-xs text-neutral-400">{sortedHymns.length}</span>
              </div>
              {/* Sort tabs */}
              <div className="flex items-center gap-0.5">
                {SORT_TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      const sorted = sortHymns(initialHymns, tab.value)
                      sortedHymnsRef.current = sorted
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
              {sortedHymns.map(hymn => {
                const isActive = hymn.id === currentHymn.id
                return (
                  <div
                    key={hymn.id}
                    data-active={isActive}
                    onClick={() => playHymn(hymn)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer border-b border-neutral-50 last:border-0 transition-colors ${
                      isActive ? "bg-neutral-100" : "hover:bg-neutral-50"
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium leading-snug line-clamp-2 ${isActive ? "text-neutral-900" : "text-neutral-700"}`}>
                        {hymn.title}
                      </p>
                      {hymn.channel && (
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{hymn.channel.title}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Lyrics */}
        <aside className="lg:sticky lg:top-16 lg:self-start">
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5">
            <LyricsPanel lyrics={currentHymn.lyrics} lyricsSuggestion={currentHymn.lyricsSuggestion} aiLyrics={currentHymn.aiLyrics} hymnId={currentHymn.id} userId={userId} />
          </div>
        </aside>
      </div>
    </div>
  )
}
