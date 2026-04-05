import Link from "next/link"
import { SmSermon } from "@/types/models/sermon"
import { Video, Plus } from "lucide-react"
import Pager from "@/components/ui/Pager"

interface SermonMyListProps {
  sermons: SmSermon[]
  total: number
  page: number
  totalPages: number
  baseUrl: string
}

const statusBadge: Record<string, string> = {
  Accepted: "bg-green-100 text-green-700",
  Submitted: "bg-amber-100 text-amber-700",
  Declined: "bg-red-100 text-red-700",
}

export default function SermonMyList({ sermons, total, page, totalPages, baseUrl }: SermonMyListProps) {
  const PAGE_SIZE = 20

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My sermons</h2>
          <p className="text-xs text-slate-400">{total.toLocaleString()} sermon{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/sermons/submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Submit sermon
        </Link>
      </div>

      {/* Top pagination */}
      <div className="mb-4">
        <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />
      </div>

      {sermons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Video className="w-12 h-12 mb-4 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold">No sermons yet</p>
          <p className="text-sm mt-1 opacity-60">Submit your first sermon above</p>
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
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sermons.map((sermon, i) => (
                <tr key={sermon.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{sermon.languages?.map(l => l.name).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{sermon.categories?.map(c => c.name).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{sermon.subCategories?.map(s => s.name).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {sermon.title.length > 40 ? sermon.title.slice(0, 40) + "…" : sermon.title}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[sermon.approvalStatus?.name ?? ""] ?? "bg-slate-100 text-slate-600"}`}>
                      {sermon.approvalStatus?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/sermons/my-sermons/${sermon.id}`}
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
        <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />
      </div>
    </div>
  )
}
