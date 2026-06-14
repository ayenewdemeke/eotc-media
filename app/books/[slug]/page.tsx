import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/auth"
import { getBook, getRelatedBooks } from "@/lib/api/books"
import { absoluteUrl, jsonLd } from "@/lib/seo"
import Navbar from "@/components/Navbar"
import BookSidebar from "@/components/books/BookSidebar"
import BookDetailClient from "@/components/books/BookDetailClient"
import BookCard from "@/components/books/BookCard"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const book = await getBook(slug)
  if (!book) return { title: "Book Not Found" }
  const description =
    book.description ??
    `Read the spiritual book "${book.name}" by ${book.author} on EOTC Media. ` +
    `"${book.name}" መንፈሳዊ መጽሐፍ በ${book.author} ያንብቡ።`
  return {
    title: `${book.name} — Spiritual Book | መንፈሳዊ መጽሐፍ`,
    description,
    keywords: [
      book.name, book.author, "Amharic spiritual book", "Ethiopian Orthodox book",
      "መንፈሳዊ መጽሐፍ", "የቤተ ክርስቲያን መጽሐፍ",
    ],
    alternates: { canonical: `/books/${encodeURIComponent(slug)}` },
    openGraph: {
      title: `${book.name} — Spiritual Book | መንፈሳዊ መጽሐፍ`,
      description,
      url: `/books/${encodeURIComponent(slug)}`,
      type: "book",
    },
  }
}

export default async function BookPage({ params }: PageProps) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const book = await getBook(slug, userId)
  if (!book) notFound()

  const relatedBooks = await getRelatedBooks(book)

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Book",
            name: book.name,
            author: { "@type": "Person", name: book.author },
            description: book.description ?? undefined,
            url: absoluteUrl(`/books/${encodeURIComponent(slug)}`),
            inLanguage: "am",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Spiritual Books", item: absoluteUrl("/books") },
              { "@type": "ListItem", position: 3, name: book.name, item: absoluteUrl(`/books/${encodeURIComponent(slug)}`) },
            ],
          }),
        }}
      />
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <BookSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
            <BookDetailClient book={book} userId={userId} />

            {relatedBooks.length > 0 && (
              <section className="mt-10">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Related books</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {relatedBooks.map(rb => (
                    <BookCard key={rb.id} book={rb} />
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
