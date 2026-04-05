import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DescriptionSuggestionActions from "@/components/admin/sermons/DescriptionSuggestionActions"

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function DescriptionSuggestionsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)
  const PAGE_SIZE = 50

  const [sermons, total] = await Promise.all([
    prisma.smSermon.findMany({
      where: { descriptionSuggestion: { not: null } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        preacher: true,
        descriptionSuggestion: true,
        approvalStatus: { select: { name: true } },
      },
    }),
    prisma.smSermon.count({ where: { descriptionSuggestion: { not: null } } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const statusColor: Record<string, string> = {
    Accepted: "bg-green-100 text-green-700",
    Submitted: "bg-amber-100 text-amber-700",
    Declined: "bg-red-100 text-red-700",
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Description suggestions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} pending</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Preacher</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sermons.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                  No description suggestions
                </td>
              </tr>
            )}
            {sermons.map((sermon, index) => (
              <tr key={sermon.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 line-clamp-1">{sermon.title}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{sermon.preacher ?? "—"}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[sermon.approvalStatus.name] ?? "bg-slate-100 text-slate-600"}`}>
                    {sermon.approvalStatus.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <DescriptionSuggestionActions
                    sermonId={sermon.id}
                    sermonTitle={sermon.title}
                    descriptionSuggestion={sermon.descriptionSuggestion ?? ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/sermons/admin/description-suggestions?page=${page - 1}`} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-slate-500">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/sermons/admin/description-suggestions?page=${page + 1}`} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
