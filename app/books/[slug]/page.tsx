import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { getBook } from "@/lib/api/books"
import Navbar from "@/components/Navbar"
import BookSidebar from "@/components/books/BookSidebar"
import BookDetailClient from "@/components/books/BookDetailClient"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)
  if (!book) return { title: "Book Not Found" }
  return { title: `${book.name} | EOTC Media` }
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const book = await getBook(slug, userId)
  if (!book) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <BookSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
            <BookDetailClient book={book} userId={userId} />
          </main>
        </div>
      </div>
    </div>
  )
}
