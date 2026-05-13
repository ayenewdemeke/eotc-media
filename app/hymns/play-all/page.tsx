import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
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

  const { hymns } = await getHymns({
    page: 1,
    limit: 200,
    view,
    languageId,
    categoryId,
    subCategoryId,
    singerId,
    channelId,
    collectionId,
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
