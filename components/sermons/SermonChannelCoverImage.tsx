"use client"

import { useEffect, useState } from "react"

export default function SermonChannelCoverImage({ src, alt }: { src: string; alt: string }) {
  const [show, setShow] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => { setShow(true) }, [])

  if (!show || failed) return null

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}
