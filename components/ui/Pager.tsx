import Link from "next/link"

interface PagerProps {
  page: number
  totalPages: number
  baseUrl: string // e.g. "/books/my-books"
}

function pageUrl(baseUrl: string, p: number) {
  return p === 1 ? baseUrl : `${baseUrl}?page=${p}`
}

export default function Pager({ page, totalPages, baseUrl }: PagerProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
  }

  const withEllipsis: (number | "…")[] = []
  let prev = 0
  for (const p of pages) {
    if (p - prev > 1) withEllipsis.push("…")
    withEllipsis.push(p)
    prev = p
  }

  const base = "inline-flex items-center justify-center h-8 min-w-[2rem] px-2.5 text-sm rounded-lg border transition-colors"
  const inactive = `${base} border-slate-200 text-slate-600 hover:bg-slate-50`
  const active = `${base} border-blue-600 bg-blue-600 text-white pointer-events-none`

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {page > 1 && (
        <Link href={pageUrl(baseUrl, page - 1)} className={inactive}>‹</Link>
      )}
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="h-8 flex items-center px-1 text-sm text-slate-400">…</span>
        ) : (
          <Link key={p} href={pageUrl(baseUrl, p as number)} className={p === page ? active : inactive}>
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={pageUrl(baseUrl, page + 1)} className={inactive}>›</Link>
      )}
    </div>
  )
}
