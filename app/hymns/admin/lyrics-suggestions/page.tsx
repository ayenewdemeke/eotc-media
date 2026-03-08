import { prisma } from "@/lib/prisma"
import Link from "next/link"
import LyricsSuggestionActions from "@/components/admin/hymns/LyricsSuggestionActions"

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function LyricsSuggestionsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)
  const PAGE_SIZE = 50

  const [hymns, total] = await Promise.all([
    prisma.hmHymn.findMany({
      where: { lyricsSuggestion: { not: null } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        singer: true,
        lyricsSuggestion: true,
        approvalStatus: { select: { name: true } },
      },
    }),
    prisma.hmHymn.count({ where: { lyricsSuggestion: { not: null } } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lyrics Suggestions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total.toLocaleString()} pending</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Singer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hymns.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                  No lyrics suggestions
                </td>
              </tr>
            )}
            {hymns.map((hymn, index) => (
              <LyricsSuggestionRow
                key={hymn.id}
                index={(page - 1) * PAGE_SIZE + index + 1}
                hymn={hymn}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/hymns/admin/lyrics-suggestions?page=${page - 1}`}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-slate-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/hymns/admin/lyrics-suggestions?page=${page + 1}`}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function LyricsSuggestionRow({
  index,
  hymn,
}: {
  index: number
  hymn: {
    id: number
    title: string
    singer: string | null
    lyricsSuggestion: string | null
    approvalStatus: { name: string }
  }
}) {
  const statusColor: Record<string, string> = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Rejected: "bg-red-100 text-red-700",
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-slate-400 text-xs">{index}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900 line-clamp-1">{hymn.title}</p>
      </td>
      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{hymn.singer ?? "—"}</td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            statusColor[hymn.approvalStatus.name] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {hymn.approvalStatus.name}
        </span>
      </td>
      <td className="px-4 py-3">
        <LyricsSuggestionActions
          hymnId={hymn.id}
          hymnTitle={hymn.title}
          lyricsSuggestion={hymn.lyricsSuggestion ?? ""}
        />
      </td>
    </tr>
  )
}
