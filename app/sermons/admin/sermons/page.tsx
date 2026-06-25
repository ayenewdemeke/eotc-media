import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SermonApproveDeclineButtons from "@/components/admin/sermons/SermonApproveDeclineButtons"
import SermonAdminActions from "@/components/admin/sermons/SermonAdminActions"
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
  searchParams: Promise<{ status?: string; page?: string }>
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  Accepted: "success",
  Submitted: "warning",
  Declined: "destructive",
}

function Pagination({ page, totalPages, status }: { page: number; totalPages: number; status?: string }) {
  if (totalPages <= 1) return null
  const q = status ? `&status=${status}` : ""
  const href = (p: number) => `/sermons/admin/sermons?page=${p}${q}`

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

export default async function AdminSermonsPage({ searchParams }: PageProps) {
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

  const [sermons, total] = await Promise.all([
    prisma.smSermon.findMany({
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
    prisma.smSermon.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const isPending = status === "pending"
  const pageTitle = isPending ? "New sermons" : "All sermons"

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-6">
      <PageHeader title={pageTitle} description={`${total.toLocaleString()} sermons`} />

      <Pagination page={page} totalPages={totalPages} status={status} />

      <Card>
        <CardContent className="p-0">
          <Table className="whitespace-nowrap">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">#</TableHead>
                <TableHead className="px-4">Language</TableHead>
                <TableHead className="px-4">Category</TableHead>
                <TableHead className="px-4">Subcategory</TableHead>
                <TableHead className="px-4">Preacher</TableHead>
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
              {sermons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isPending ? 10 : 7} className="py-14 text-center text-muted-foreground">
                    No sermons found
                  </TableCell>
                </TableRow>
              )}
              {sermons.map((sermon, i) => (
                <TableRow key={sermon.id}>
                  <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{sermon.languages.map(l => l.language.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{sermon.categories.map(c => c.category.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{sermon.subCategories.map(s => s.subCategory.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{sermon.preacher ?? "—"}</TableCell>
                  <TableCell className="px-4">
                    <Badge variant={statusVariant[sermon.approvalStatus.name] ?? "secondary"}>
                      {sermon.approvalStatus.name}
                    </Badge>
                  </TableCell>
                  {isPending ? (
                    <>
                      <TableCell className="px-4">
                        <a
                          href={`https://www.youtube.com/watch?v=${sermon.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          view
                        </a>
                      </TableCell>
                      <SermonApproveDeclineButtons sermonId={sermon.id} sermonTitle={sermon.title} />
                    </>
                  ) : (
                    <TableCell className="px-4">
                      <SermonAdminActions sermonId={sermon.id} slug={sermon.slug} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} status={status} />
    </div>
  )
}
