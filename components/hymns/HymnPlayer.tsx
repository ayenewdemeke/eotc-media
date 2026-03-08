"use client"

import { useEffect } from "react"

interface HymnPlayerProps {
  videoId: string
  slug: string
}

export default function HymnPlayer({ videoId, slug }: HymnPlayerProps) {
  useEffect(() => {
    fetch(`/api/hymns/${slug}/click`, { method: "POST" }).catch(() => {})
  }, [slug])

  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Hymn video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
