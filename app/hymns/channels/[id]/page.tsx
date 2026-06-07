import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getHymns, getHymnsFilterData } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnSearchFilters from "@/components/hymns/HymnSearchFilters"
import HymnInfiniteGrid from "@/components/hymns/HymnInfiniteGrid"
import ChannelCoverImage from "@/components/hymns/ChannelCoverImage"

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
  const channel = await prisma.hmChannel.findUnique({ where: { id: channelId } })
  if (!channel) return { title: "Channel — EOTC Media" }
  return { title: `${channel.title} — Hymns | EOTC Media` }
}

const PAGE_SIZE = 24

export default async function ChannelHymnsPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const channelId = parseInt(id)
  if (isNaN(channelId)) notFound()

  const { language, category, subCategory, sort } = await searchParams

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [channel, { hymns, total }, { categories, subCategories, languages, singers, singersByLanguage }] =
    await Promise.all([
      prisma.hmChannel.findUnique({
        where: { id: channelId },
        include: { _count: { select: { hymns: true } } },
      }),
      getHymns({ channelId, languageId, categoryId, subCategoryId, sort, userId }),
      getHymnsFilterData(),
    ])

  if (!channel) notFound()

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const basePath = `/hymns/channels/${id}`

  // Strip any existing Google CDN params (=s0, =w400, etc.) before appending crop params
  const coverBase = channel.coverImage
    ? channel.coverImage.replace(/=\w[^/]*$/, "")
    : null

  const avatarSrc = channel.thumbnailHigh || channel.thumbnailMedium || channel.thumbnailDefault

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">

          <HymnSidebar userId={userId} />

          <main className="pb-8">
            {/* Cover image banner */}
            <div className="relative w-full h-32 sm:h-44 bg-gradient-to-r from-blue-100 to-slate-100">
              {coverBase && (
                <ChannelCoverImage
                  src={`${coverBase}=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`}
                  alt={channel.title}
                />
              )}
            </div>

            {/* Channel identity */}
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-end gap-4 -mt-8 sm:-mt-10 mb-4">
                {/* Avatar */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-2xl font-bold text-blue-600">
                    {channel.title.charAt(0).toUpperCase()}
                  </span>
                  {avatarSrc && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={avatarSrc}
                      alt={channel.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                {/* Back link — aligned to bottom of avatar row */}
                <div className="pb-1 ml-auto">
                  <Link href="/hymns/channels" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                    ← All Channels
                  </Link>
                </div>
              </div>

              {/* Title + meta */}
              <h1 className="text-lg font-bold text-slate-900 leading-snug">{channel.title}</h1>
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
                <span>{channel._count.hymns} {channel._count.hymns === 1 ? "hymn" : "hymns"}</span>
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
                <HymnSearchFilters
                  categories={categories}
                  subCategories={subCategories}
                  languages={languages}
                  singers={singers}
                  singersByLanguage={singersByLanguage}
                  basePath={basePath}
                  hideSingerMode
                />
              </div>

              <HymnInfiniteGrid
                initialHymns={hymns}
                initialTotal={total}
                initialTotalPages={totalPages}
                filters={{ language, category, subCategory, sort, channel: id }}
                userId={userId}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
