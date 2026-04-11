import { prisma } from "@/lib/prisma"
import FeaturedItemsClient from "./FeaturedItemsClient"

export default async function AdminFeaturedPage() {
  const featuredItems = await prisma.featuredItem.findMany({ orderBy: { orderBy: "asc" } })

  // Enrich with actual hymn/sermon titles
  const enriched = await Promise.all(
    featuredItems.map(async (item) => {
      if (item.moduleType === "hymn") {
        const hymn = await prisma.hmHymn.findUnique({
          where: { id: item.itemId },
          select: { id: true, title: true, slug: true },
        })
        return { ...item, resolvedTitle: hymn?.title ?? `Hymn #${item.itemId}`, slug: hymn?.slug ?? "" }
      } else {
        const sermon = await prisma.smSermon.findUnique({
          where: { id: item.itemId },
          select: { id: true, title: true, slug: true },
        })
        return { ...item, resolvedTitle: sermon?.title ?? `Sermon #${item.itemId}`, slug: sermon?.slug ?? "" }
      }
    })
  )

  return <FeaturedItemsClient items={enriched} />
}
