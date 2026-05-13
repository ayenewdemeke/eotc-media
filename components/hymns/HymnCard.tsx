"use client"

import Link from "next/link"
import Image from "next/image"
import { MousePointerClick } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"
import SaveToListButton from "./SaveToListButton"

interface HymnCardProps {
  hymn: HmHymn
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

export default function HymnCard({ hymn, userId }: HymnCardProps) {
  const thumbnail = hymn.thumbnailMedium || hymn.thumbnailDefault
  const channelAvatar = hymn.channel?.thumbnailDefault || hymn.channel?.thumbnailMedium || hymn.channel?.thumbnailHigh
  const singers = hymn.singers && hymn.singers.length > 0 ? hymn.singers : null
  const channelInitial = (hymn.channel?.title || "M").charAt(0).toUpperCase()

  return (
    <div className="group flex flex-col gap-2.5">
      {/* Thumbnail */}
      <Link
        href={`/hymns/${hymn.slug}`}
        className="relative block aspect-video rounded-xl overflow-hidden bg-neutral-100"
      >
        <Image
          src={thumbnail}
          alt={hymn.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </Link>

      {/* Below thumbnail: avatar + meta */}
      <div className="flex gap-2.5 min-w-0 items-start">
        {/* Channel avatar */}
        {channelAvatar ? (
          <Link href={`/hymns/channels/${hymn.channel!.id}`} className="flex-shrink-0 mt-0.5">
            <Image
              src={channelAvatar}
              alt={hymn.channel!.title}
              width={36}
              height={36}
              className="rounded-full object-cover w-9 h-9"
              unoptimized
            />
          </Link>
        ) : (
          <Link
            href={hymn.channel ? `/hymns/channels/${hymn.channel.id}` : `/hymns/${hymn.slug}`}
            className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-sm font-semibold select-none"
          >
            {channelInitial}
          </Link>
        )}

        {/* Text + three-dot menu */}
        <div className="flex gap-1 min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <Link href={`/hymns/${hymn.slug}`}>
            <h3 className="text-[13px] font-semibold text-neutral-900 leading-snug line-clamp-2">
              {hymn.title}
            </h3>
          </Link>

          <div className="flex flex-col gap-0.5">
            {hymn.channel?.title && (
              <Link
                href={`/hymns/channels/${hymn.channel.id}`}
                className="text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors truncate"
              >
                {hymn.channel.title}
              </Link>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 flex-wrap">
              {hymn.clicksCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <MousePointerClick className="w-3 h-3" />
                  {hymn.clicksCount.toLocaleString()} clicks
                </span>
              )}
              {hymn.clicksCount > 0 && hymn.publishedAt && <span>·</span>}
              {hymn.publishedAt && <span>{timeAgo(hymn.publishedAt)}</span>}
            </div>

            {singers && (
              <div className="flex items-center gap-1 flex-wrap text-[11px] text-neutral-400">
                {singers.map((s, i) => (
                  <span key={s.id}>
                    <Link
                      href={`/hymns/singer/${s.id}`}
                      className="font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                    >
                      {s.name}
                    </Link>
                    {i < singers.length - 1 && <span>,</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Three-dot save menu — shown on hover for logged-in users */}
        {userId && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            <SaveToListButton hymnId={hymn.id} userId={userId} initialFavorited={hymn.isFavorited} />
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
