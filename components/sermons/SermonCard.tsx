"use client"

import Link from "next/link"
import Image from "next/image"
import { MousePointerClick } from "lucide-react"
import { SmSermon } from "@/types/models/sermon"
import { cardThumbCandidates } from "@/lib/thumbnails"
import FallbackImage from "@/components/FallbackImage"

interface SermonCardProps {
  sermon: SmSermon
  userId?: number
}

function timeAgo(date: Date | null): string {
  if (!date) return ""
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export default function SermonCard({ sermon, userId: _userId }: SermonCardProps) {
  const thumbCandidates = cardThumbCandidates(sermon)
  const channelAvatar = sermon.channel?.thumbnailDefault || sermon.channel?.thumbnailMedium || sermon.channel?.thumbnailHigh
  const preachers = sermon.preachers && sermon.preachers.length > 0 ? sermon.preachers : null
  const channelInitial = (sermon.channel?.name || "S").charAt(0).toUpperCase()

  return (
    <div className="group flex flex-col gap-2.5">
      {/* Thumbnail */}
      <Link
        href={`/sermons/${sermon.slug}`}
        prefetch={false}
        className="relative block aspect-video rounded-xl overflow-hidden bg-neutral-100"
      >
        <FallbackImage
          candidates={thumbCandidates}
          alt={sermon.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </Link>

      {/* Below thumbnail: avatar + meta */}
      <div className="flex gap-2.5 min-w-0">
        {/* Channel avatar */}
        {channelAvatar ? (
          <Link href={`/sermons/channels/${sermon.channel!.id}`} prefetch={false} className="flex-shrink-0 mt-0.5">
            <Image
              src={channelAvatar}
              alt={sermon.channel!.name}
              width={36}
              height={36}
              className="rounded-full object-cover w-9 h-9"
              unoptimized
            />
          </Link>
        ) : (
          <Link
            href={sermon.channel ? `/sermons/channels/${sermon.channel.id}` : `/sermons/${sermon.slug}`}
            prefetch={false}
            className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-sm font-semibold select-none"
          >
            {channelInitial}
          </Link>
        )}

        {/* Text */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <Link href={`/sermons/${sermon.slug}`} prefetch={false}>
            <h3 className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2">
              {sermon.title}
            </h3>
          </Link>

          <div className="flex flex-col gap-0.5">
            {sermon.channel?.name && (
              <Link
                href={`/sermons/channels/${sermon.channel.id}`}
                prefetch={false}
                className="text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors truncate"
              >
                {sermon.channel.name}
              </Link>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 flex-wrap">
              {sermon.clicksCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <MousePointerClick className="w-3 h-3" />
                  {sermon.clicksCount.toLocaleString()} clicks
                </span>
              )}
              {sermon.clicksCount > 0 && sermon.publishedAt && <span>·</span>}
              {sermon.publishedAt && <span>{timeAgo(sermon.publishedAt)}</span>}
            </div>

            {preachers && (
              <div className="flex items-center gap-1 flex-wrap text-[11px] text-neutral-400">
                {preachers.map((p, i) => (
                  <span key={p.id}>
                    <span className="font-medium text-neutral-500">{p.name}</span>
                    {i < preachers.length - 1 && <span>,</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
