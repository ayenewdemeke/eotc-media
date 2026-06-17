"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { whenYTReady } from "@/lib/youtube-iframe-api"

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
  const pendingPlay = useRef(false)

  const thumbSrc = thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any

    whenYTReady(() => {
      if (!mountRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as typeof window & { YT: any }
      player = new w.YT.Player(mountRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            playerRef.current = player
            if (pendingPlay.current) {
              pendingPlay.current = false
              player.playVideo()
            }
          },
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
    if (playerRef.current) {
      playerRef.current.playVideo()
    } else {
      pendingPlay.current = true
    }
  }

  return (
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
      {/* YT player mount point — always in the DOM so the player pre-loads */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Thumbnail overlay — removed immediately on click */}
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
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-200" />
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
