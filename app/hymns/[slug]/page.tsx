import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { getHymn, getRelatedHymns } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnPlayer from "@/components/hymns/HymnPlayer"
import LyricsPanel from "@/components/hymns/LyricsPanel"
import FavoriteButton from "@/components/hymns/FavoriteButton"
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

  const categoryIds = hymn.categories?.map(c => c.id) ?? []
  const related = await getRelatedHymns(hymn.id, categoryIds, 8)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Back link */}
          <Link
            href="/hymns"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hymns
          </Link>

          {/* Main content: side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* Left: Player + metadata + comments (lyrics injected here on mobile) */}
            <div>
              {/* On mobile: player sticks below navbar; parent div now includes lyrics so sticky lasts until after lyrics */}
              <div className="sticky top-16 z-10 bg-white pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 lg:static lg:top-auto lg:z-auto lg:bg-transparent lg:mx-0 lg:px-0 lg:pb-0">
                <HymnPlayer videoId={hymn.videoId} slug={hymn.slug} />
              </div>

              {/* Lyrics panel — mobile only (placed here so sticky player covers it while scrolling) */}
              <div className="lg:hidden mt-4">
                <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
                  <LyricsPanel lyrics={hymn.lyrics} />
                </div>
              </div>

              {/* Title + actions */}
              <div className="mt-5 flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{hymn.title}</h1>
                <FavoriteButton
                  hymnId={hymn.id}
                  initialFavorited={isFavorited}
                  userId={userId}
                  className="flex-shrink-0 mt-0.5"
                />
              </div>

              {/* Channel + singers */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                {hymn.channel?.title && (
                  <Link
                    href={`/hymns/channels/${hymn.channel.id}`}
                    className="flex items-center gap-2 group/ch"
                  >
                    {hymn.channel.thumbnailHigh && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={hymn.channel.thumbnailHigh}
                        alt={hymn.channel.title}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <span className="font-medium text-slate-700 group-hover/ch:text-blue-600 transition-colors">
                      {hymn.channel.title}
                    </span>
                  </Link>
                )}
                {hymn.singers && hymn.singers.length > 0 && (
                  <span className="flex items-center gap-1.5 flex-wrap">
                    {hymn.channel?.title && <span className="text-slate-300">·</span>}
                    {hymn.singers.map((s, i) => (
                      <span key={s.id}>
                        <Link
                          href={`/hymns/singer/${s.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {s.name}
                        </Link>
                        {i < (hymn.singers?.length ?? 0) - 1 && <span className="text-slate-300">,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {hymn.clicksCount > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{hymn.clicksCount.toLocaleString()} clicks</span>
                  </>
                )}
              </div>

              {/* Comments */}
              <CommentSection hymnId={hymn.id} comments={comments} userId={userId} />
            </div>

            {/* Right: Lyrics panel — desktop only */}
            <aside className="hidden lg:block lg:sticky lg:top-[5.5rem] lg:self-start">
              <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
                <LyricsPanel lyrics={hymn.lyrics} />
              </div>
            </aside>
          </div>

          {/* Related hymns */}
          {related.length > 0 && (
            <section className="mt-14 pt-10 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Related Hymns</h2>
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
