import type { Metadata } from "next"
import { auth } from "@/auth"
import { getSermons, getSermonsFilterData } from "@/lib/api/sermons"
import Navbar from "@/components/Navbar"
import SermonSidebar from "@/components/sermons/SermonSidebar"
import SermonSearchFilters from "@/components/sermons/SermonSearchFilters"
import SermonInfiniteGrid from "@/components/sermons/SermonInfiniteGrid"

export const metadata: Metadata = { title: "Sermons | EOTC Media" }

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

  const [{ sermons, total }, { categories, subCategories, languages, categoriesByLanguage }] =
    await Promise.all([
      getSermons({ languageId, categoryId, subCategoryId, search, sort, userId }),
      getSermonsFilterData(),
    ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <SermonSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
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
