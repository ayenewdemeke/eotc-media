import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { getSermons } from "@/lib/api/sermons"
import Navbar from "@/components/Navbar"
import SermonPlayAllPlayer from "@/components/sermons/SermonPlayAllPlayer"

export const metadata: Metadata = { title: "Play All — Sermons | EOTC Media" }

interface PageProps {
  searchParams: Promise<{
    view?: string
    language?: string
    category?: string
    subCategory?: string
    preacher?: string
    channel?: string
    search?: string
    sort?: string
  }>
}

export default async function SermonPlayAllPage({ searchParams }: PageProps) {
  const { view, language, category, subCategory, preacher, channel, search, sort } = await searchParams

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined
  const preacherId = preacher ? parseInt(preacher) || undefined : undefined
  const channelId = channel ? parseInt(channel) || undefined : undefined

  const { sermons } = await getSermons({
    page: 1,
    limit: 200,
    view,
    languageId,
    categoryId,
    subCategoryId,
    preacherId,
    channelId,
    search,
    sort,
    userId,
  })

  if (sermons.length === 0) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <SermonPlayAllPlayer sermons={sermons} userId={userId} />
      </div>
    </div>
  )
}
