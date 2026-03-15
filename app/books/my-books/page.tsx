import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { getBooks } from "@/lib/api/books"
import Navbar from "@/components/Navbar"
import BookSidebar from "@/components/books/BookSidebar"
import BookMyList from "@/components/books/BookMyList"

export const metadata: Metadata = { title: "My Books | EOTC Media" }

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MyBooksPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const { books, total } = await getBooks({ page, limit: PAGE_SIZE, userId, view: "my-books" })
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildPageUrl(p: number) {
    return `/books/my-books?page=${p}`
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <BookSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-base font-semibold text-slate-900">My Books</h1>
              <Link
                href="/books/submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Upload Book
              </Link>
            </div>
            <BookMyList
              books={books}
              page={page}
              totalPages={totalPages}
              buildPageUrl={buildPageUrl}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
