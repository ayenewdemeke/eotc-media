import { prisma } from "@/lib/prisma"
import Link from "next/link"
import HymnApproveDeclineButtons from "@/components/admin/hymns/HymnApproveDeclineButtons"
import HymnAdminActions from "@/components/admin/hymns/HymnAdminActions"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  Accepted: "success",
  Submitted: "warning",
  Declined: "destructive",
}

function Pagination({ page, totalPages, status, q }: { page: number; totalPages: number; status?: string; q?: string }) {
  if (totalPages <= 1) return null
  const qs = [status && `status=${status}`, q && `q=${encodeURIComponent(q)}`].filter(Boolean).join("&")
  const href = (p: number) => `/hymns/admin/hymns?page=${p}${qs ? `&${qs}` : ""}`

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

  const linkClass = "px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {page > 1 && (
        <Link href={href(page - 1)} className={linkClass}>← Prev</Link>
      )}
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 py-1.5 text-sm text-muted-foreground">…</span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            className={cn(
              linkClass,
              p === page && "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages && (
        <Link href={href(page + 1)} className={linkClass}>Next →</Link>
      )}
    </div>
  )
}

export default async function AdminHymnsPage({ searchParams }: PageProps) {
  const { status, page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)
  const PAGE_SIZE = 20
  const search = q?.trim() || undefined

  const where: Record<string, unknown> = {}
  if (status === "pending") {
    where.approvalStatus = { name: "Submitted" }
  } else if (status === "approved") {
    where.approvalStatus = { name: "Accepted" }
  } else if (status === "rejected") {
    where.approvalStatus = { name: "Declined" }
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { singer: { contains: search, mode: "insensitive" } },
    ]
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

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-6">
      <PageHeader title={pageTitle} description={`${total.toLocaleString()} hymns`} />

      <form method="GET" action="/hymns/admin/hymns" className="flex items-center gap-2 max-w-sm">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by title or singer…"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]"
        />
        <button type="submit" className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">Search</button>
      </form>

      <Pagination page={page} totalPages={totalPages} status={status} q={search} />

      <Card>
        <CardContent className="p-0">
          <Table className="whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">#</TableHead>
                <TableHead className="px-4">Language</TableHead>
                <TableHead className="px-4">Category</TableHead>
                <TableHead className="px-4">Subcategory</TableHead>
                <TableHead className="px-4">Singer</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4" />
                {isPending && (
                  <>
                    <TableHead className="px-4" />
                    <TableHead className="px-4" />
                    <TableHead className="px-4" />
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hymns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isPending ? 10 : 7} className="py-14 text-center text-muted-foreground">
                    No hymns found
                  </TableCell>
                </TableRow>
              )}
              {hymns.map((hymn, i) => (
                <TableRow key={hymn.id}>
                  <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{hymn.languages.map(l => l.language.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{hymn.categories.map(c => c.category.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{hymn.subCategories.map(s => s.subCategory.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{hymn.singer ?? "—"}</TableCell>
                  <TableCell className="px-4">
                    <Badge variant={statusVariant[hymn.approvalStatus.name] ?? "secondary"}>
                      {hymn.approvalStatus.name}
                    </Badge>
                  </TableCell>
                  {isPending ? (
                    <>
                      <TableCell className="px-4">
                        <a
                          href={`https://www.youtube.com/watch?v=${hymn.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          view
                        </a>
                      </TableCell>
                      <HymnApproveDeclineButtons hymnId={hymn.id} hymnTitle={hymn.title} />
                    </>
                  ) : (
                    <TableCell className="px-4">
                      <HymnAdminActions hymnId={hymn.id} slug={hymn.slug} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} status={status} q={search} />
    </div>
  )
}
