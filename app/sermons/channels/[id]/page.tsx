import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSermons, getSermonsFilterData } from "@/lib/api/sermons"
import Navbar from "@/components/Navbar"
import SermonSidebar from "@/components/sermons/SermonSidebar"
import SermonSearchFilters from "@/components/sermons/SermonSearchFilters"
import SermonInfiniteGrid from "@/components/sermons/SermonInfiniteGrid"
import SermonChannelCoverImage from "@/components/sermons/SermonChannelCoverImage"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    language?: string
    category?: string
    subCategory?: string
    sort?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const channelId = parseInt(id)
  if (isNaN(channelId)) return { title: "Channel — EOTC Media" }
  const channel = await prisma.smChannel.findUnique({ where: { id: channelId } })
  if (!channel) return { title: "Channel — EOTC Media" }
  return { title: `${channel.name} — Sermons | EOTC Media` }
}

const PAGE_SIZE = 24

export default async function SermonChannelPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const channelId = parseInt(id)
  if (isNaN(channelId)) notFound()

  const { language, category, subCategory, sort } = await searchParams

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [channel, { sermons, total }, { categories, subCategories, languages, categoriesByLanguage }] =
    await Promise.all([
      prisma.smChannel.findUnique({
        where: { id: channelId },
        include: { _count: { select: { sermons: true } } },
      }),
      getSermons({ channelId, languageId, categoryId, subCategoryId, sort, userId }),
      getSermonsFilterData(),
    ])

  if (!channel) notFound()

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const basePath = `/sermons/channels/${id}`

  const coverBase = channel.coverImage
    ? channel.coverImage.replace(/=\w[^/]*$/, "")
    : null

  const avatarSrc = channel.thumbnailHigh || channel.thumbnailMedium || channel.thumbnailDefault

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <SermonSidebar userId={userId} />

          <main className="pb-8">
            {/* Cover image banner */}
            <div className="relative w-full h-32 sm:h-44 bg-gradient-to-r from-blue-100 to-slate-100">
              {coverBase && (
                <SermonChannelCoverImage
                  src={`${coverBase}=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`}
                  alt={channel.name}
                />
              )}
            </div>

            {/* Channel identity */}
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-end gap-4 -mt-8 sm:-mt-10 mb-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-2xl font-bold text-blue-600">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                  {avatarSrc && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={avatarSrc}
                      alt={channel.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="pb-1 ml-auto">
                  <Link href="/sermons/channels" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                    ← All Channels
                  </Link>
                </div>
              </div>

              <h1 className="text-lg font-bold text-slate-900 leading-snug">{channel.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                {channel.handle && (
                  <a
                    href={`https://www.youtube.com/${channel.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {channel.handle.startsWith("@") ? channel.handle : `@${channel.handle}`}
                  </a>
                )}
                <span>{channel._count.sermons} {channel._count.sermons === 1 ? "sermon" : "sermons"}</span>
              </div>
              {channel.description && (
                <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3 max-w-2xl">
                  {channel.description.length > 250
                    ? channel.description.slice(0, 250) + "…"
                    : channel.description}
                </p>
              )}
            </div>

            {/* Filters + grid */}
            <div className="px-4 sm:px-6 lg:px-8 mt-6">
              <div className="mb-5">
                <SermonSearchFilters
                  categories={categories}
                  subCategories={subCategories}
                  languages={languages}
                  categoriesByLanguage={categoriesByLanguage}
                  basePath={basePath}
                />
              </div>
              <SermonInfiniteGrid
                initialSermons={sermons}
                initialTotal={total}
                initialTotalPages={totalPages}
                filters={{ language, category, subCategory, sort, channel: id }}
                userId={userId}
                basePath={basePath}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
