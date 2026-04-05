import Link from "next/link"
import { prisma } from "@/lib/prisma"
import BookApproveDeclineButtons from "@/components/admin/books/BookApproveDeclineButtons"

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const { page: pageParam, status } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)
  const isPending = status === "pending"

  let approvalStatusId: number | undefined
  if (isPending) {
    const s = await prisma.cbApprovalStatus.findFirst({ where: { name: { contains: "Pending", mode: "insensitive" } } })
    approvalStatusId = s?.id
  }

  const where = approvalStatusId ? { approvalStatusId } : {}

  const [books, total] = await Promise.all([
    prisma.cbBook.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        approvalStatus: true,
        languages: { include: { language: true } },
        categories: { include: { category: true } },
        subCategories: { include: { subCategory: true } },
        authors: { include: { author: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.cbBook.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildUrl(p: number) {
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (status) params.set("status", status)
    return `/books/admin/books?${params}`
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{isPending ? "New books" : "All books"}</h1>
        <div className="flex gap-2">
          <Link href="/books/admin/books" className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${!isPending ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            All
          </Link>
          <Link href="/books/admin/books?status=pending" className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${isPending ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            Pending
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Language</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">No books</td></tr>
              )}
              {books.map((book, i) => (
                <tr key={book.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{book.languages.map(l => l.language.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{book.categories.map(c => c.category.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">
                    <Link href={`/books/${book.slug}`} target="_blank" className="hover:text-blue-600">{book.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {book.authors.length > 0 ? book.authors.map(a => a.author.name).join(", ") : book.author}
                  </td>
                  <td className="px-4 py-3">
                    <BookApproveDeclineButtons bookId={book.id} currentStatus={book.approvalStatus?.name ?? ""} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/books/admin/books/${book.id}/edit`} className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4">
          {page > 1 && <Link href={buildUrl(page - 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link>}
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          {page < totalPages && <Link href={buildUrl(page + 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link>}
        </div>
      )}
    </div>
  )
}
