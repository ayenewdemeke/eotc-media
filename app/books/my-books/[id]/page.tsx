import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import BookSidebar from "@/components/books/BookSidebar"
import { ArrowLeft, FileText } from "lucide-react"

const STATUS_BADGE: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MyBookDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { id } = await params
  const bookId = parseInt(id)
  if (!bookId) notFound()

  const book = await prisma.cbBook.findFirst({
    where: { id: bookId, userId },
    include: {
      approvalStatus: true,
      languages: { include: { language: true } },
      categories: { include: { category: true } },
      subCategories: { include: { subCategory: true } },
      authors: { include: { author: true } },
    },
  })
  if (!book) notFound()

  const statusName = (book.approvalStatus as { name: string } | null)?.name ?? "Pending"
  const coverUrl = book.image ? `/api/books/images/${book.image}` : null
  const fileUrl = book.file ? `/api/books/files/${book.file}` : null

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <BookSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl">

              <Link href="/books/my-books" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                My books
              </Link>

              <div className="flex gap-5 items-start mb-6">
                {coverUrl ? (
                  <img src={coverUrl} alt={book.name} className="w-28 rounded-lg border border-slate-200 object-cover flex-shrink-0" />
                ) : (
                  <div className="w-28 h-36 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h1 className="text-xl font-semibold text-slate-900">{book.name}</h1>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[statusName] ?? "bg-slate-100 text-slate-600"}`}>
                      {statusName}
                    </span>
                  </div>
                  {book.author && (
                    <p className="text-sm text-slate-500 mb-3">{book.author}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(book.languages as { language: { id: number; name: string } }[])?.map(l => (
                      <span key={l.language.id} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{l.language.name}</span>
                    ))}
                    {(book.categories as { category: { id: number; name: string } }[])?.map(c => (
                      <span key={c.category.id} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{c.category.name}</span>
                    ))}
                    {(book.subCategories as { subCategory: { id: number; name: string; categoryId: number } }[])?.map(sc => (
                      <span key={sc.subCategory.id} className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{sc.subCategory.name}</span>
                    ))}
                  </div>
                </div>
              </div>

              {book.description && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View PDF
                </a>
              ) : (
                <p className="text-sm text-slate-400">No file available</p>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
