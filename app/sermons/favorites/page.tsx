import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { getSermons, getSermonsFilterData } from "@/lib/api/sermons"
import Navbar from "@/components/Navbar"
import SermonSidebar from "@/components/sermons/SermonSidebar"
import SermonSearchFilters from "@/components/sermons/SermonSearchFilters"
import SermonInfiniteGrid from "@/components/sermons/SermonInfiniteGrid"

export const metadata: Metadata = { title: "Favorite Sermons | EOTC Media" }

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{
    language?: string
    category?: string
    subCategory?: string
    sort?: string
  }>
}

export default async function FavoriteSermonPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { language, category, subCategory, sort } = await searchParams

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined

  const [{ sermons, total }, { categories, subCategories, languages, categoriesByLanguage }] =
    await Promise.all([
      getSermons({ languageId, categoryId, subCategoryId, sort, userId, view: "favorites" }),
      getSermonsFilterData(),
    ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <SermonSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-5">
              <SermonSearchFilters
                categories={categories}
                subCategories={subCategories}
                languages={languages}
                categoriesByLanguage={categoriesByLanguage}
                basePath="/sermons/favorites"
              />
            </div>
            <SermonInfiniteGrid
              initialSermons={sermons}
              initialTotal={total}
              initialTotalPages={totalPages}
              filters={{ view: "favorites", language, category, subCategory, sort }}
              userId={userId}
              basePath="/sermons/favorites"
            />
          </main>
        </div>
      </div>
    </div>
  )
}
