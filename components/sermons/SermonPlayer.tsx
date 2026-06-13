"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Play, Loader2 } from "lucide-react"
import { whenYTReady } from "@/lib/youtube-iframe-api"

interface SermonPlayerProps {
  videoId: string
  slug: string
  thumbnail?: string | null
  title?: string
}

export default function SermonPlayer({ videoId, slug, thumbnail, title }: SermonPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const mountRef = useRef<HTMLDivElement>(null)

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
          onReady: () => { playerRef.current = player },
          onStateChange: (e: { data: number }) => {
            if (e.data === 1) { // YT.PlayerState.PLAYING
              setPlaying(true)
              setLoading(false)
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
    fetch(`/api/sermons/${slug}/click`, { method: "POST" }).catch(() => {})
    setLoading(true)
    playerRef.current?.playVideo()
  }

  return (
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
      {/* YT player mount point — always in the DOM so the player pre-loads */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Thumbnail overlay — stays until video is actually playing */}
      {!playing && (
        <div
          className="absolute inset-0 group cursor-pointer"
          onClick={!loading ? handlePlay : undefined}
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
              {loading
                ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                : <Play className="w-7 h-7 text-white ml-1 drop-shadow" fill="currentColor" />
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
