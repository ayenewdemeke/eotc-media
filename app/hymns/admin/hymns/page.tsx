import { prisma } from "@/lib/prisma"
import Link from "next/link"
import HymnApproveDeclineButtons from "@/components/admin/hymns/HymnApproveDeclineButtons"
import HymnAdminActions from "@/components/admin/hymns/HymnAdminActions"

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

function Pagination({ page, totalPages, status }: { page: number; totalPages: number; status?: string }) {
  if (totalPages <= 1) return null
  const q = status ? `&status=${status}` : ""
  const href = (p: number) => `/hymns/admin/hymns?page=${p}${q}`

  // Build page number list: always show first, last, current ±2, with ellipsis
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
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {page > 1 && (
        <Link href={href(page - 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link>
      )}
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 py-1.5 text-sm text-slate-400">…</span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              p === page ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={href(page + 1)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link>
      )}
    </div>
  )
}

export default async function AdminHymnsPage({ searchParams }: PageProps) {
  const { status, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)
  const PAGE_SIZE = 20

  const where: Record<string, unknown> = {}
  if (status === "pending") {
    where.approvalStatus = { name: "Submitted" }
  } else if (status === "approved") {
    where.approvalStatus = { name: "Accepted" }
  } else if (status === "rejected") {
    where.approvalStatus = { name: "Declined" }
  }

  const [hymns, total] = await Promise.all([
    prisma.hmHymn.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        approvalStatus: true,
        languages: { include: { language: true }, take: 3 },
        categories: { include: { category: true }, take: 2 },
        subCategories: { include: { subCategory: true }, take: 2 },
      },
    }),
    prisma.hmHymn.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const isPending = status === "pending"
  const pageTitle = isPending ? "New hymns" : "All hymns"

  const statusBadge: Record<string, string> = {
    Accepted: "bg-green-100 text-green-700",
    Submitted: "bg-amber-100 text-amber-700",
    Declined: "bg-red-100 text-red-700",
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total.toLocaleString()} hymns</p>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} status={status} />

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto my-4">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subcategory</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Singer</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              {/* action columns */}
              <th className="px-4 py-2.5" />
              {isPending && (
                <>
                  <th className="px-4 py-2.5" />
                  <th className="px-4 py-2.5" />
                  <th className="px-4 py-2.5" />
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hymns.length === 0 && (
              <tr>
                <td colSpan={isPending ? 11 : 8} className="py-14 text-center text-slate-400 text-sm">
                  No hymns found
                </td>
              </tr>
            )}
            {hymns.map((hymn, i) => (
              <tr key={hymn.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.languages.map(l => l.language.name).join(", ") || "—"}</td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.categories.map(c => c.category.name).join(", ") || "—"}</td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.subCategories.map(s => s.subCategory.name).join(", ") || "—"}</td>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  {hymn.title.length > 40 ? hymn.title.slice(0, 40) + "…" : hymn.title}
                </td>
                <td className="px-4 py-2.5 text-slate-600 text-xs">{hymn.singer ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[hymn.approvalStatus.name] ?? "bg-slate-100 text-slate-600"}`}>
                    {hymn.approvalStatus.name}
                  </span>
                </td>
                {isPending ? (
                  <>
                    {/* view on YouTube */}
                    <td className="px-4 py-2.5">
                      <a
                        href={`https://www.youtube.com/watch?v=${hymn.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:underline"
                      >
                        view
                      </a>
                    </td>
                    {/* new singer | accept | decline — renders 3 tds */}
                    <HymnApproveDeclineButtons hymnId={hymn.id} hymnTitle={hymn.title} />
                  </>
                ) : (
                  <td className="px-4 py-2.5">
                    <HymnAdminActions hymnId={hymn.id} slug={hymn.slug} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} status={status} />
    </div>
  )
}
