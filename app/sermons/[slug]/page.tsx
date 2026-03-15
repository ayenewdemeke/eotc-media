import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { getSermon, getRelatedSermons } from "@/lib/api/sermons"
import Navbar from "@/components/Navbar"
import SermonPlayer from "@/components/sermons/SermonPlayer"
import SermonFavoriteButton from "@/components/sermons/SermonFavoriteButton"
import SermonCard from "@/components/sermons/SermonCard"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const result = await getSermon(slug, userId)
  if (!result) return {}
  return {
    title: `${result.sermon.title} — Sermons | EOTC Media`,
    description: result.sermon.description ?? `Watch and listen to ${result.sermon.title} on EOTC Media.`,
  }
}

export default async function SermonPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const result = await getSermon(slug, userId)
  if (!result) notFound()

  const { sermon, isFavorited } = result

  const categoryIds = sermon.categories?.map(c => c.id) ?? []
  const related = await getRelatedSermons(sermon.id, categoryIds, 8)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <Link
            href="/sermons"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sermons
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            <div>
              {/* Sticky player on mobile */}
              <div className="sticky top-16 z-10 bg-white pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 lg:static lg:top-auto lg:z-auto lg:bg-transparent lg:mx-0 lg:px-0 lg:pb-0">
                <SermonPlayer videoId={sermon.videoId} slug={sermon.slug} />
              </div>

              {/* Title + favorite */}
              <div className="mt-5 flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{sermon.title}</h1>
                <SermonFavoriteButton
                  sermonId={sermon.id}
                  initialFavorited={isFavorited}
                  userId={userId}
                  className="flex-shrink-0 mt-0.5"
                />
              </div>

              {/* Channel + preachers + clicks */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                {sermon.channel?.name && (
                  <Link
                    href={`/sermons/channels/${sermon.channel.id}`}
                    className="flex items-center gap-2 group/ch"
                  >
                    {sermon.channel.thumbnailHigh && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sermon.channel.thumbnailHigh}
                        alt={sermon.channel.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <span className="font-medium text-slate-700 group-hover/ch:text-blue-600 transition-colors">
                      {sermon.channel.name}
                    </span>
                  </Link>
                )}
                {sermon.preachers && sermon.preachers.length > 0 && (
                  <span className="flex items-center gap-1.5 flex-wrap">
                    {sermon.channel?.name && <span className="text-slate-300">·</span>}
                    <span className="text-slate-400 text-xs">by</span>
                    {sermon.preachers.map((p, i) => (
                      <span key={p.id}>
                        <span className="text-slate-600 font-medium">{p.name}</span>
                        {i < (sermon.preachers?.length ?? 0) - 1 && <span className="text-slate-300">,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {sermon.clicksCount > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{sermon.clicksCount.toLocaleString()} clicks</span>
                  </>
                )}
              </div>

              {/* Description */}
              {sermon.description && (
                <div className="mt-5 bg-slate-50/60 border border-slate-100 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-slate-700 mb-2">Description</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{sermon.description}</p>
                </div>
              )}
            </div>

            {/* Right panel: categories & languages */}
            <aside className="hidden lg:block lg:sticky lg:top-[5.5rem] lg:self-start">
              <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-4">
                {sermon.categories && sermon.categories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {sermon.categories.map(c => (
                        <span key={c.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {sermon.languages && sermon.languages.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {sermon.languages.map(l => (
                        <span key={l.id} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(!sermon.categories?.length && !sermon.languages?.length) && (
                  <p className="text-xs text-slate-400">No metadata available</p>
                )}
              </div>
            </aside>
          </div>

          {/* Related sermons */}
          {related.length > 0 && (
            <section className="mt-14 pt-10 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Related Sermons</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-7">
                {related.map(s => (
                  <SermonCard key={s.id} sermon={s} userId={userId} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
