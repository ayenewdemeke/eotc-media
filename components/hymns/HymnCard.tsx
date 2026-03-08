"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, MousePointerClick } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"
import FavoriteButton from "./FavoriteButton"

interface HymnCardProps {
  hymn: HmHymn
  userId?: number
}

function timeAgo(date: Date | null): string {
  if (!date) return ""
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? "year" : "years"} ago`
}

export default function HymnCard({ hymn, userId }: HymnCardProps) {
  const thumbnail = hymn.thumbnailMedium || hymn.thumbnailDefault
  const language = hymn.languages?.[0]?.name
  const singers = hymn.singers && hymn.singers.length > 0 ? hymn.singers : null

  return (
    <div className="group">
      {/* Thumbnail — the main clickable link */}
      <Link href={`/hymns/${hymn.slug}`} className="block relative aspect-video rounded-xl overflow-hidden bg-slate-100">
        <Image
          src={thumbnail}
          alt={hymn.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 shadow-lg">
            <Play className="w-5 h-5 text-slate-900 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {/* Favorite button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <FavoriteButton
            hymnId={hymn.id}
            initialFavorited={hymn.isFavorited ?? false}
            userId={userId}
          />
        </div>
        {/* Language badge */}
        {language && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white/90 backdrop-blur-sm">
              {language}
            </span>
          </div>
        )}
      </Link>

      {/* Meta — outside the main link so right-click on "More from" works correctly */}
      <div className="mt-2.5 space-y-0.5">
        {/* Title */}
        <Link href={`/hymns/${hymn.slug}`} className="block">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {hymn.title}
          </h3>
        </Link>

        {/* Channel · date */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-wrap">
          {hymn.channel?.title && (
            <span className="truncate max-w-[140px]">{hymn.channel.title}</span>
          )}
          {hymn.channel?.title && hymn.publishedAt && <span>·</span>}
          {hymn.publishedAt && <span>{timeAgo(hymn.publishedAt)}</span>}
        </div>

        {/* Clicks · More from {singer(s)} */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-wrap">
          {hymn.clicksCount > 0 && (
            <span className="flex items-center gap-0.5">
              <MousePointerClick className="w-3 h-3" />
              {hymn.clicksCount.toLocaleString()} clicks
            </span>
          )}
          {singers && singers.length > 0 && (
            <>
              {hymn.clicksCount > 0 && <span>·</span>}
              <span>More from</span>
              {singers.map((s, i) => (
                <span key={s.id}>
                  <Link href={`/hymns/singer/${s.id}`} className="text-blue-600 hover:underline">
                    {s.name}
                  </Link>
                  {i < singers.length - 1 && <span className="text-slate-400">,</span>}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
