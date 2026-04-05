import type { Metadata } from "next"
import { auth } from "@/auth"
import { getHymns, getHymnsFilterData } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnSearchFilters from "@/components/hymns/HymnSearchFilters"
import HymnInfiniteGrid from "@/components/hymns/HymnInfiniteGrid"

export const metadata: Metadata = {
  title: "Hymns — EOTC Media",
  description: "Browse Ethiopian Orthodox Tewahedo Church hymns and spiritual songs.",
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

  const [{ hymns, total }, { categories, subCategories, languages, singers, singersByLanguage }] = await Promise.all([
    getHymns({ categoryId, subCategoryId, languageId, singerId, userId, search, sort }),
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
