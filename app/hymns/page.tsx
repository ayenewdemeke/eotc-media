import type { Metadata } from "next"
import { auth } from "@/auth"
import { getHymns, getHymnsFilterData } from "@/lib/api/hymns"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnSearchFilters from "@/components/hymns/HymnSearchFilters"
import HymnInfiniteGrid from "@/components/hymns/HymnInfiniteGrid"
import HymnCard from "@/components/hymns/HymnCard"
import { Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Mezmur — Ethiopian Orthodox Tewahedo Hymns | መዝሙሮች",
  description:
    "Listen to Ethiopian Orthodox Tewahedo Church (EOTC) mezmurs and spiritual songs in Amharic, " +
    "organized by singer, category and language with lyrics. " +
    "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን መዝሙሮች ከግጥሞቻቸው ጋር — በዘማሪ፣ በምድብ እና በቋንቋ ተደራጅተው።",
  keywords: [
    "EOTC mezmur", "Ethiopian Orthodox mezmur", "Amharic mezmur", "Orthodox Tewahedo hymns",
    "mezmur lyrics", "መዝሙር", "መዝሙሮች", "ኦርቶዶክስ መዝሙር", "የመዝሙር ግጥሞች", "መንፈሳዊ መዝሙራት",
  ],
  alternates: { canonical: "/hymns" },
  openGraph: {
    title: "Mezmur — Ethiopian Orthodox Tewahedo Hymns | መዝሙሮች",
    description: "Listen to EOTC mezmurs and spiritual songs with lyrics. የኦርቶዶክስ ተዋሕዶ መዝሙሮች ከግጥሞቻቸው ጋር።",
    url: "/hymns",
  },
}

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    subCategory?: string
    language?: string
    singer?: string
    sort?: string
  }>
}

export default async function HymnsPage({ searchParams }: PageProps) {
  const { search, category, subCategory, language, singer, sort } = await searchParams

  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined
  const languageId = !language || language === "all" ? undefined : parseInt(language) || undefined
  const singerId = singer ? parseInt(singer) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [{ hymns, total }, { categories, subCategories, languages, singers, singersByLanguage }, featuredRecords] = await Promise.all([
    getHymns({ categoryId, subCategoryId, languageId, singerId, userId, search, sort }),
    getHymnsFilterData(),
    prisma.featuredItem.findMany({ where: { moduleType: "hymn" }, orderBy: { orderBy: "asc" } }),
  ])

  const { hymns: featuredHymnsRaw } = featuredRecords.length > 0
    ? await getHymns({ itemIds: featuredRecords.map(f => f.itemId), userId, limit: featuredRecords.length })
    : { hymns: [] }
  // Preserve the admin-defined order
  const featuredHymns = featuredRecords
    .map(f => featuredHymnsRaw.find(h => h.id === f.itemId))
    .filter(Boolean) as typeof featuredHymnsRaw

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">

          <HymnSidebar userId={userId} />

          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            {featuredHymns.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Featured</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
                  {featuredHymns.map(h => <HymnCard key={h.id} hymn={h} userId={userId} />)}
                </div>
                <div className="mt-6 border-t border-neutral-100" />
              </section>
            )}
            <div className="mb-5">
              <HymnSearchFilters
                categories={categories}
                subCategories={subCategories}
                languages={languages}
                singers={singers}
                singersByLanguage={singersByLanguage}
              />
            </div>
            <HymnInfiniteGrid
              initialHymns={hymns}
              initialTotal={total}
              initialTotalPages={totalPages}
              filters={{ search, category, subCategory, language, singer, sort }}
              userId={userId}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
