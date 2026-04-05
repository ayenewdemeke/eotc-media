"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

interface SermonPlayerProps {
  videoId: string
  slug: string
  thumbnail?: string | null
  title?: string
}

export default function SermonPlayer({ videoId, slug, thumbnail, title }: SermonPlayerProps) {
  const [playing, setPlaying] = useState(false)

  const thumbSrc =
    thumbnail ||
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  function handlePlay() {
    fetch(`/api/sermons/${slug}/click`, { method: "POST" }).catch(() => {})
    setPlaying(true)
  }

  if (playing) {
    return (
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title || "Sermon video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className="group relative aspect-video w-full bg-black rounded-xl overflow-hidden cursor-pointer"
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

      {/* overlay */}
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-200" />

      {/* frosted glass play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 group-hover:bg-white/30 backdrop-blur-md border border-white/40 transition-all duration-200">
          <Play className="w-7 h-7 text-white ml-1 drop-shadow" fill="currentColor" />
        </div>
      </div>
    </div>
  )
}
