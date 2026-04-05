import type { Metadata } from "next"
import { auth } from "@/auth"
import { getBooks, getBooksFilterData } from "@/lib/api/books"
import Navbar from "@/components/Navbar"
import BookSidebar from "@/components/books/BookSidebar"
import BookSearchFilters from "@/components/books/BookSearchFilters"
import BookInfiniteGrid from "@/components/books/BookInfiniteGrid"

export const metadata: Metadata = { title: "Books | EOTC Media" }

interface PageProps {
  searchParams: Promise<{ language?: string; category?: string; subCategory?: string; sort?: string; search?: string }>
}

export default async function BooksPage({ searchParams }: PageProps) {
  const { language, category, subCategory, sort, search } = await searchParams

  const languageId = language ? parseInt(language) || undefined : undefined
  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [{ books, total }, { categories, subCategories, languages, categoriesByLanguage }] = await Promise.all([
    getBooks({ languageId, categoryId, subCategoryId, sort, search }),
    getBooksFilterData(),
  ])

  const totalPages = Math.ceil(total / 24)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <BookSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-5">
              <BookSearchFilters
                categories={categories}
                subCategories={subCategories}
                languages={languages}
                categoriesByLanguage={categoriesByLanguage}
              />
            </div>
            <BookInfiniteGrid
              initialBooks={books}
              initialTotal={total}
              initialTotalPages={totalPages}
              filters={{ language, category, subCategory, sort, search }}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
