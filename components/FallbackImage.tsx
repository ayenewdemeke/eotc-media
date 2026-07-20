"use client"

import { useState, useEffect } from "react"

interface FallbackImageProps {
  candidates: string[]
  alt: string
  className?: string
  loading?: "lazy" | "eager"
}

// Renders the first working URL from an ordered candidate list, stepping to the
// next one whenever the current image fails to load. Plain <img> on purpose:
// YouTube already serves size-appropriate JPEGs, so routing them through
// next/image would only spend Vercel image-transformation quota.
export default function FallbackImage({ candidates, alt, className, loading = "lazy" }: FallbackImageProps) {
  const [index, setIndex] = useState(0)

  // Restart the chain when the image target changes (e.g. player advances)
  const key = candidates[0] ?? ""
  useEffect(() => { setIndex(0) }, [key])

  if (candidates.length === 0) return null
  const src = candidates[Math.min(index, candidates.length - 1)]

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setIndex(i => (i < candidates.length - 1 ? i + 1 : i))}
    />
  )
}
