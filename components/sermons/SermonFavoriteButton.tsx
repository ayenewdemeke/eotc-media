"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

interface SermonFavoriteButtonProps {
  sermonId: number
  initialFavorited: boolean
  userId?: number
  className?: string
}

export default function SermonFavoriteButton({
  sermonId,
  initialFavorited,
  userId,
  className = "",
}: SermonFavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      window.location.href = "/auth/login"
      return
    }

    setFavorited(prev => !prev)
    setLoading(true)
    try {
      const res = await fetch("/api/sermons/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sermonId }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
    } catch {
      setFavorited(prev => !prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150
        ${favorited
          ? "bg-red-500 text-white shadow-md"
          : "bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
        } ${className}`}
    >
      <Heart
        className="w-4 h-4"
        fill={favorited ? "currentColor" : "none"}
        strokeWidth={favorited ? 0 : 2}
      />
    </button>
  )
}
