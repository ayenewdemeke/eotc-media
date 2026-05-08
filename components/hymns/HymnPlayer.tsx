"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

// ── YouTube IFrame API singleton loader ───────────────────────────────────────
// Ensures the script is loaded once regardless of how many HymnPlayer instances
// are on the page, and queues callbacks until the API is ready.
let ytScriptLoaded = false
const ytReadyCallbacks: (() => void)[] = []

function loadYTScript() {
  if (ytScriptLoaded) return
  ytScriptLoaded = true
  ;(window as typeof window & { onYouTubeIframeAPIReady: () => void }).onYouTubeIframeAPIReady = () => {
    ytReadyCallbacks.splice(0).forEach(cb => cb())
  }
  const tag = document.createElement("script")
  tag.src = "https://www.youtube.com/iframe_api"
  document.head.appendChild(tag)
}

function whenYTReady(cb: () => void) {
  if (typeof window === "undefined") return
  const w = window as typeof window & { YT?: { Player: unknown } }
  if (w.YT?.Player) { cb(); return }
  loadYTScript()
  ytReadyCallbacks.push(cb)
}
// ─────────────────────────────────────────────────────────────────────────────

interface HymnPlayerProps {
  videoId: string
  slug: string
  thumbnail?: string | null
  title?: string
}

export default function HymnPlayer({ videoId, slug, thumbnail, title }: HymnPlayerProps) {
  const [playing, setPlaying] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const mountRef = useRef<HTMLDivElement>(null)

  const thumbSrc = thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  // Initialise the YT Player as soon as the API is ready.
  // The player mounts into a hidden div so it is ready to play on first click
  // without requiring a second user gesture — which is the key to making
  // autoplay work reliably on iOS Safari and other mobile browsers.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any

    whenYTReady(() => {
      if (!mountRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as typeof window & { YT: any }
      player = new w.YT.Player(mountRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,   // required for inline play on iOS
        },
        events: {
          onReady: () => { playerRef.current = player },
        },
      })
    })

    return () => {
      player?.destroy?.()
      playerRef.current = null
    }
  }, [videoId])

  function handlePlay() {
    fetch(`/api/hymns/${slug}/click`, { method: "POST" }).catch(() => {})
    setPlaying(true)
    // playVideo() is called directly on the YT Player instance.
    // Because this runs inside a user-gesture handler (onClick → handlePlay),
    // iOS Safari treats it as an interactive play and allows it.
    playerRef.current?.playVideo()
  }

  return (
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
      {/* YT player mount point — always in the DOM so the player pre-loads */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Thumbnail overlay — sits on top until the user clicks play */}
      {!playing && (
        <div
          className="absolute inset-0 group cursor-pointer"
          onClick={handlePlay}
        >
          <Image
            src={thumbSrc}
            alt={title || "Play video"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
            unoptimized
            priority
          />
          {/* dim overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-200" />
          {/* frosted-glass play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/40 transition-all duration-200">
              <Play className="w-7 h-7 text-white ml-1 drop-shadow" fill="currentColor" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
