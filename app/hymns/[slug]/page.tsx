import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { getHymn, getRelatedHymns } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnPlayer from "@/components/hymns/HymnPlayer"
import LyricsPanel from "@/components/hymns/LyricsPanel"
import FavoriteButton from "@/components/hymns/FavoriteButton"
import SaveToListButton from "@/components/hymns/SaveToListButton"
import CommentSection from "@/components/hymns/CommentSection"
import HymnCard from "@/components/hymns/HymnCard"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const result = await getHymn(slug, userId)
  if (!result) return {}
  return {
    title: `${result.hymn.title} — Hymns | EOTC Media`,
    description: result.hymn.description ?? `Watch and listen to ${result.hymn.title} on EOTC Media.`,
  }
}

export default async function HymnPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const result = await getHymn(slug, userId)
  if (!result) notFound()

  const { hymn, isFavorited, comments } = result

  const related = await getRelatedHymns({
    hymnId: hymn.id,
    categoryIds: hymn.categories?.map(c => c.id) ?? [],
    subCategoryIds: hymn.subCategories?.map(sc => sc.id) ?? [],
    languageIds: hymn.languages?.map(l => l.id) ?? [],
    channelId: hymn.channel?.id,
    singerIds: hymn.singers?.map(s => s.id) ?? [],
    userId,
  }, 10)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-11 pt-4 pb-8">

          {/* Main content: side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_402px] gap-6 items-start">

            {/* Left: Player + metadata + comments (lyrics injected here on mobile) */}
            <div>
              {/* On mobile: player sticks below navbar; parent div now includes lyrics so sticky lasts until after lyrics */}
              <div className="sticky top-16 z-10 bg-white pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 lg:static lg:top-auto lg:z-auto lg:bg-transparent lg:mx-0 lg:px-0 lg:pb-0">
                <HymnPlayer videoId={hymn.videoId} slug={hymn.slug} thumbnail={hymn.thumbnailMaxres || hymn.thumbnailStandard || hymn.thumbnailHigh} title={hymn.title} />
              </div>

              {/* Lyrics panel — mobile only */}
              <div className="lg:hidden mt-4">
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                  <LyricsPanel lyrics={hymn.lyrics} lyricsSuggestion={hymn.lyricsSuggestion} aiLyrics={hymn.aiLyrics} hymnId={hymn.id} userId={userId} />
                </div>
              </div>

              {/* Title + favorite + save to list */}
              <div className="mt-4 flex items-start justify-between gap-4">
                <h1 className="text-base font-bold text-neutral-900 leading-snug">{hymn.title}</h1>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  <FavoriteButton
                    hymnId={hymn.id}
                    initialFavorited={isFavorited}
                    userId={userId}
                  />
                  {userId && (
                    <SaveToListButton hymnId={hymn.id} userId={userId} initialFavorited={isFavorited} />
                  )}
                </div>
              </div>

              {/* Channel + singers + clicks */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {hymn.channel?.title && (
                  <Link
                    href={`/hymns/channels/${hymn.channel.id}`}
                    className="flex items-center gap-2"
                  >
                    {hymn.channel.thumbnailHigh ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={hymn.channel.thumbnailHigh}
                        alt={hymn.channel.title}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-semibold text-neutral-600 flex-shrink-0">
                        {hymn.channel.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                      {hymn.channel.title}
                    </span>
                  </Link>
                )}
                {hymn.singers && hymn.singers.length > 0 && (
                  <span className="flex items-center gap-1.5 flex-wrap text-sm text-neutral-500">
                    {hymn.channel?.title && <span className="text-neutral-300">·</span>}
                    {hymn.singers.map((s, i) => (
                      <span key={s.id}>
                        <Link href={`/hymns/singer/${s.id}`} className="hover:text-neutral-800 transition-colors">
                          {s.name}
                        </Link>
                        {i < (hymn.singers?.length ?? 0) - 1 && <span className="text-neutral-300">,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {hymn.clicksCount > 0 && (
                  <>
                    <span className="text-neutral-300 text-sm">·</span>
                    <span className="text-xs text-neutral-400">{hymn.clicksCount.toLocaleString()} clicks</span>
                  </>
                )}
              </div>

              {/* Comments */}
              <CommentSection hymnId={hymn.id} comments={comments} userId={userId} />
            </div>

            {/* Right: Lyrics panel — desktop only */}
            <aside className="hidden lg:block lg:sticky lg:top-16 lg:self-start">
              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                <LyricsPanel lyrics={hymn.lyrics} lyricsSuggestion={hymn.lyricsSuggestion} aiLyrics={hymn.aiLyrics} hymnId={hymn.id} userId={userId} />
              </div>
            </aside>
          </div>

          {/* Related hymns */}
          {related.length > 0 && (
            <section className="mt-14 pt-10 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Related hymns</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-7">
                {related.map(h => (
                  <HymnCard key={h.id} hymn={h} userId={userId} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
