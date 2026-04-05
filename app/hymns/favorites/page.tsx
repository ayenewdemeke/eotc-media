import type { Metadata } from "next"
import { auth } from "@/auth"
import { getHymns, getHymnsFilterData } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnSearchFilters from "@/components/hymns/HymnSearchFilters"
import HymnInfiniteGrid from "@/components/hymns/HymnInfiniteGrid"

export const metadata: Metadata = { title: "Favorites — Hymns | EOTC Media" }

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{
    language?: string
    category?: string
    subCategory?: string
    sort?: string
  }>
}

export default async function FavoritesPage({ searchParams }: PageProps) {
  const { language, category, subCategory, sort } = await searchParams

  const languageId = !language || language === "all" ? undefined : parseInt(language) || undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [{ hymns, total }, { categories, subCategories, languages, singers, singersByLanguage }] = await Promise.all([
    getHymns({ categoryId, subCategoryId, languageId, userId, view: "favorites", sort }),
    getHymnsFilterData(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-5">
              <HymnSearchFilters
                categories={categories}
                subCategories={subCategories}
                languages={languages}
                singers={singers}
                singersByLanguage={singersByLanguage}
                basePath="/hymns/favorites"
              />
            </div>
            <HymnInfiniteGrid
              initialHymns={hymns}
              initialTotal={total}
              initialTotalPages={totalPages}
              filters={{ language, category, subCategory, sort, view: "favorites" }}
              userId={userId}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
