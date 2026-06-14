import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DescriptionSuggestionActions from "@/components/admin/sermons/DescriptionSuggestionActions"
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

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  Accepted: "success",
  Submitted: "warning",
  Declined: "destructive",
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
  const linkClass = "px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageHeader title="Description suggestions" description={`${total.toLocaleString()} pending`} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">#</TableHead>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="hidden px-4 sm:table-cell">Preacher</TableHead>
                <TableHead className="hidden px-4 md:table-cell">Status</TableHead>
                <TableHead className="px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sermons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                    No description suggestions
                  </TableCell>
                </TableRow>
              )}
              {sermons.map((sermon, index) => (
                <TableRow key={sermon.id}>
                  <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className="px-4">
                    <p className="line-clamp-1 font-medium">{sermon.title}</p>
                  </TableCell>
                  <TableCell className="hidden px-4 text-muted-foreground sm:table-cell">{sermon.preacher ?? "—"}</TableCell>
                  <TableCell className="hidden px-4 md:table-cell">
                    <Badge variant={statusVariant[sermon.approvalStatus.name] ?? "secondary"}>
                      {sermon.approvalStatus.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <DescriptionSuggestionActions
                      sermonId={sermon.id}
                      sermonTitle={sermon.title}
                      descriptionSuggestion={sermon.descriptionSuggestion ?? ""}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/sermons/admin/description-suggestions?page=${page - 1}`} className={linkClass}>
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/sermons/admin/description-suggestions?page=${page + 1}`} className={linkClass}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
