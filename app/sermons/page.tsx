import type { Metadata } from "next"
import { auth } from "@/auth"
import { getSermons, getSermonsFilterData } from "@/lib/api/sermons"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import SermonSidebar from "@/components/sermons/SermonSidebar"
import SermonSearchFilters from "@/components/sermons/SermonSearchFilters"
import SermonInfiniteGrid from "@/components/sermons/SermonInfiniteGrid"
import SermonCard from "@/components/sermons/SermonCard"
import { Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Sermons — Ethiopian Orthodox Tewahedo Teachings | ስብከቶች",
  description:
    "Watch and listen to Ethiopian Orthodox Tewahedo Church sermons and spiritual teachings in Amharic, " +
    "organized by preacher, category and language. " +
    "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ስብከቶች እና ትምህርቶች — በሰባኪ፣ በምድብ እና በቋንቋ ተደራጅተው።",
  keywords: [
    "Ethiopian Orthodox sermons", "Amharic sermons", "EOTC teachings", "Orthodox Tewahedo sermon",
    "ስብከት", "ስብከቶች", "የኦርቶዶክስ ስብከት", "መንፈሳዊ ትምህርት",
  ],
  alternates: { canonical: "/sermons" },
  openGraph: {
    title: "Sermons — Ethiopian Orthodox Tewahedo Teachings | ስብከቶች",
    description: "Watch EOTC sermons and spiritual teachings. የኦርቶዶክስ ተዋሕዶ ስብከቶች እና ትምህርቶች።",
    url: "/sermons",
  },
}

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{
    language?: string
    category?: string
    subCategory?: string
    search?: string
    sort?: string
  }>
}

export default async function SermonsPage({ searchParams }: PageProps) {
  const { language, category, subCategory, search, sort } = await searchParams

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [{ sermons, total }, { categories, subCategories, languages, categoriesByLanguage }, featuredRecords] =
    await Promise.all([
      getSermons({ languageId, categoryId, subCategoryId, search, sort, userId }),
      getSermonsFilterData(),
      prisma.featuredItem.findMany({ where: { moduleType: "sermon" }, orderBy: { orderBy: "asc" } }),
    ])

  const { sermons: featuredSermonsRaw } = featuredRecords.length > 0
    ? await getSermons({ itemIds: featuredRecords.map(f => f.itemId), userId, limit: featuredRecords.length })
    : { sermons: [] }
  const featuredSermons = featuredRecords
    .map(f => featuredSermonsRaw.find(s => s.id === f.itemId))
    .filter(Boolean) as typeof featuredSermonsRaw

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <SermonSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            {featuredSermons.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Featured</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
                  {featuredSermons.map(s => <SermonCard key={s.id} sermon={s} userId={userId} />)}
                </div>
                <div className="mt-6 border-t border-neutral-100" />
              </section>
            )}
            <div className="mb-5">
              <SermonSearchFilters
                categories={categories}
                subCategories={subCategories}
                languages={languages}
                categoriesByLanguage={categoriesByLanguage}
              />
            </div>
            <SermonInfiniteGrid
              initialSermons={sermons}
              initialTotal={total}
              initialTotalPages={totalPages}
              filters={{ language, category, subCategory, search, sort }}
              userId={userId}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
