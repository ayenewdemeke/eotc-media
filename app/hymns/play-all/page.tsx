import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getHymns } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import PlayAllPlayer from "@/components/hymns/PlayAllPlayer"

export const metadata: Metadata = { title: "Play All — Hymns | EOTC Media" }

interface PageProps {
  searchParams: Promise<{
    view?: string
    language?: string
    category?: string
    subCategory?: string
    singer?: string
    channel?: string
    collection?: string
    search?: string
    sort?: string
  }>
}

export default async function PlayAllPage({ searchParams }: PageProps) {
  const { view, language, category, subCategory, singer, channel, collection, search, sort } = await searchParams

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined
  const singerId = singer ? parseInt(singer) || undefined : undefined
  const channelId = channel ? parseInt(channel) || undefined : undefined
  const collectionId = collection ? parseInt(collection) || undefined : undefined

  // For collection view: resolve hymn IDs directly from the collection,
  // the same way the collection detail page does it (proven to work).
  if (view === 'collection' && collectionId) {
    const col = await prisma.hmCollection.findFirst({
      where: { id: collectionId, ...(userId ? { userId } : {}) },
      include: { hymns: { orderBy: { createdAt: 'asc' }, select: { hymnId: true } } },
    })
    if (!col || col.hymns.length === 0) notFound()
    const itemIds = col.hymns.map(h => h.hymnId)
    const { hymns } = await getHymns({ itemIds, sort, userId, limit: 200 })
    if (hymns.length === 0) notFound()
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16">
          <PlayAllPlayer hymns={hymns} userId={userId} />
        </div>
      </div>
    )
  }

  const { hymns } = await getHymns({
    page: 1,
    limit: 200,
    view,
    languageId,
    categoryId,
    subCategoryId,
    singerId,
    channelId,
    search,
    sort,
    userId,
  })

  if (hymns.length === 0) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <PlayAllPlayer hymns={hymns} userId={userId} />
      </div>
    </div>
  )
}
