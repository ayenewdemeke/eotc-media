import Link from "next/link"
import { Music, Plus } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"

interface HymnMyListProps {
  hymns: HmHymn[]
  total: number
  page: number
  totalPages: number
  buildPageUrl: (p: number) => string
}

function Pagination({ page, totalPages, buildPageUrl }: { page: number; totalPages: number; buildPageUrl: (p: number) => string }) {
  if (totalPages <= 1) return null

  const pages: (number | "…")[] = []
  const add = (p: number) => { if (!pages.includes(p)) pages.push(p) }
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) add(p)
  }
  const withEllipsis: (number | "…")[] = []
  let prev = 0
  for (const p of pages as number[]) {
    if (p - prev > 1) withEllipsis.push("…")
    withEllipsis.push(p)
    prev = p
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {page > 1 && (
        <Link href={buildPageUrl(page - 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">‹ Prev</Link>
      )}
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 py-1.5 text-sm text-slate-400">…</span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(p as number)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:bg-slate-50"}`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={buildPageUrl(page + 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Next ›</Link>
      )}
    </div>
  )
}

export default function HymnMyList({ hymns, total, page, totalPages, buildPageUrl }: HymnMyListProps) {
  const PAGE_SIZE = 24

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Hymns</h2>
          <p className="text-xs text-slate-400">{total.toLocaleString()} hymn{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/hymns/submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Hymn
        </Link>
      </div>

      {/* Top pagination */}
      <div className="mb-4">
        <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
      </div>

      {hymns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Music className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold">No hymns yet</p>
          <p className="text-sm mt-1 opacity-60">Submit your first hymn above</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subcategory</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hymns.map((hymn, i) => (
                <tr key={hymn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.languages?.map(l => l.name).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.categories?.map(c => c.name).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.subCategories?.map(sc => sc.name).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-slate-500">{hymn.approvalStatus?.name ?? "Pending"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/hymns/${hymn.slug}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      view
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom pagination */}
      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
      </div>
    </div>
  )
}
