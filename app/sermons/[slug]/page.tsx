import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { getSermon, getRelatedSermons } from "@/lib/api/sermons"
import { absoluteUrl, jsonLd } from "@/lib/seo"
import Navbar from "@/components/Navbar"
import SermonPlayer from "@/components/sermons/SermonPlayer"
import { bestThumbCandidates } from "@/lib/thumbnails"
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
  const { sermon } = result
  const preachers = sermon.preachers?.map(p => p.name).join(", ")
  const description =
    sermon.description ??
    `Watch the Ethiopian Orthodox Tewahedo sermon "${sermon.title}"${preachers ? ` by ${preachers}` : ""} on EOTC Media. ` +
    `"${sermon.title}" ስብከት ይመልከቱ።`
  const thumbnail = sermon.thumbnailMaxres || sermon.thumbnailStandard || sermon.thumbnailHigh
  return {
    title: `${sermon.title} — Sermon | ስብከት`,
    description,
    keywords: [
      sermon.title, "Ethiopian Orthodox sermon", "Amharic sermon", "EOTC teaching", "ስብከት", "መንፈሳዊ ትምህርት",
      ...(sermon.preachers?.map(p => p.name) ?? []),
    ],
    alternates: { canonical: `/sermons/${encodeURIComponent(sermon.slug)}` },
    openGraph: {
      title: `${sermon.title} — Sermon | ስብከት`,
      description,
      url: `/sermons/${encodeURIComponent(sermon.slug)}`,
      type: "video.other",
      images: thumbnail ? [{ url: thumbnail, alt: sermon.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${sermon.title} — Sermon`,
      description,
      images: thumbnail ? [thumbnail] : undefined,
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: sermon.title,
            description: sermon.description ?? `Ethiopian Orthodox Tewahedo sermon "${sermon.title}".`,
            thumbnailUrl: [sermon.thumbnailMaxres, sermon.thumbnailStandard, sermon.thumbnailHigh].filter(Boolean),
            uploadDate: (sermon.publishedAt ?? sermon.createdAt).toISOString(),
            embedUrl: `https://www.youtube.com/embed/${sermon.videoId}`,
            url: absoluteUrl(`/sermons/${encodeURIComponent(sermon.slug)}`),
            inLanguage: "am",
            genre: "Religious",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Sermons", item: absoluteUrl("/sermons") },
              { "@type": "ListItem", position: 3, name: sermon.title, item: absoluteUrl(`/sermons/${encodeURIComponent(sermon.slug)}`) },
            ],
          }),
        }}
      />
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-11 pt-4 pb-8">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_402px] gap-6 items-start">

            <div>
              {/* Sticky player on mobile */}
              <div className="sticky top-16 z-10 bg-white pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 lg:static lg:top-auto lg:z-auto lg:bg-transparent lg:mx-0 lg:px-0 lg:pb-0">
                <SermonPlayer videoId={sermon.videoId} slug={sermon.slug} thumbnailCandidates={bestThumbCandidates(sermon)} title={sermon.title} />
              </div>

              {/* Title + favorite */}
              <div className="mt-4 flex items-start justify-between gap-4">
                <h1 className="text-base font-bold text-neutral-900 leading-snug">{sermon.title}</h1>
                <SermonFavoriteButton
                  sermonId={sermon.id}
                  initialFavorited={isFavorited}
                  userId={userId}
                  className="flex-shrink-0 mt-0.5"
                />
              </div>

              {/* Channel + preachers + clicks */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {sermon.channel?.name && (
                  <Link
                    href={`/sermons/channels/${sermon.channel.id}`}
                    className="flex items-center gap-2"
                  >
                    {sermon.channel.thumbnailHigh ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sermon.channel.thumbnailHigh}
                        alt={sermon.channel.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-semibold text-neutral-600 flex-shrink-0">
                        {sermon.channel.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                      {sermon.channel.name}
                    </span>
                  </Link>
                )}
                {sermon.preachers && sermon.preachers.length > 0 && (
                  <span className="flex items-center gap-1.5 flex-wrap text-sm text-neutral-500">
                    {sermon.channel?.name && <span className="text-neutral-300">·</span>}
                    {sermon.preachers.map((p, i) => (
                      <span key={p.id}>
                        <span className="text-neutral-700 font-medium">{p.name}</span>
                        {i < (sermon.preachers?.length ?? 0) - 1 && <span className="text-neutral-300">,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {sermon.clicksCount > 0 && (
                  <>
                    <span className="text-neutral-300 text-sm">·</span>
                    <span className="text-xs text-neutral-400">{sermon.clicksCount.toLocaleString()} clicks</span>
                  </>
                )}
              </div>

              {/* Description */}
              {sermon.description && (
                <div className="mt-4 bg-neutral-50 border border-neutral-100 rounded-xl p-4">
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{sermon.description}</p>
                </div>
              )}
            </div>

            {/* Right panel: categories & languages */}
            <aside className="hidden lg:block lg:sticky lg:top-16 lg:self-start">
              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 space-y-4">
                {sermon.categories && sermon.categories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {sermon.categories.map(c => (
                        <span key={c.id} className="px-2.5 py-1 bg-neutral-200 text-neutral-700 text-xs font-medium rounded-full">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {sermon.languages && sermon.languages.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {sermon.languages.map(l => (
                        <span key={l.id} className="px-2.5 py-1 bg-neutral-200 text-neutral-600 text-xs font-medium rounded-full">
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(!sermon.categories?.length && !sermon.languages?.length) && (
                  <p className="text-xs text-neutral-400">No metadata available</p>
                )}
              </div>
            </aside>
          </div>

          {/* Related sermons */}
          {related.length > 0 && (
            <section className="mt-14 pt-10 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Related sermons</h2>
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
