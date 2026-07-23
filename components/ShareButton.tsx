"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"

// Copies (or natively shares) a SHORT link like /h/123 instead of the full
// Amharic-slug URL, which browsers percent-encode into a long %E1%88… string.
export default function ShareButton({
  path,
  title,
  className = "",
}: {
  path: string       // e.g. "/h/123"
  title?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path
    // Native share sheet on mobile if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Share link"
      className={`flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer ${className}`}
    >
      {copied ? <Check className="w-[18px] h-[18px] text-green-600" /> : <Share2 className="w-[18px] h-[18px]" />}
      <span className="text-xs font-medium">{copied ? "Copied" : "Share"}</span>
    </button>
  )
}
