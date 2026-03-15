import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { CbBook } from "@/types/models/book"

interface BookMyListProps {
  books: CbBook[]
  page: number
  totalPages: number
  buildPageUrl: (page: number) => string
}

const statusBadge: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
}

function Pagination({ page, totalPages, buildPageUrl }: { page: number; totalPages: number; buildPageUrl: (p: number) => string }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {page > 1 && (
        <Link href={buildPageUrl(page - 1)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link>
      )}
      <span className="text-xs text-slate-400">{page} / {totalPages}</span>
      {page < totalPages && (
        <Link href={buildPageUrl(page + 1)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link>
      )}
    </div>
  )
}

export default function BookMyList({ books, page, totalPages, buildPageUrl }: BookMyListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subcategory</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.length === 0 && (
              <tr>
                <td colSpan={7} className="py-14 text-center text-slate-400 text-sm">No books yet</td>
              </tr>
            )}
            {books.map((book, i) => (
              <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-400 text-xs">{(page - 1) * 20 + i + 1}</td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{book.languages?.map(l => l.name).join(", ") || "—"}</td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{book.categories?.map(c => c.name).join(", ") || "—"}</td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{book.subCategories?.map(s => s.name).join(", ") || "—"}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900 max-w-[200px] truncate">
                  {book.name.length > 40 ? book.name.slice(0, 40) + "…" : book.name}
                </td>
                <td className="px-4 py-2.5">
                  {book.approvalStatus && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[book.approvalStatus.name] ?? "bg-slate-100 text-slate-600"}`}>
                      {book.approvalStatus.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/books/${book.slug}`} target="_blank" className="text-slate-400 hover:text-slate-700 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
      </div>
    </div>
  )
}
