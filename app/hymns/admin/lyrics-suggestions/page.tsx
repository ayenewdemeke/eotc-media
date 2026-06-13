import { prisma } from "@/lib/prisma"
import Link from "next/link"
import LyricsSuggestionActions from "@/components/admin/hymns/LyricsSuggestionActions"
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
  searchParams: Promise<{ page?: string; tab?: string }>
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  Accepted: "success",
  Submitted: "warning",
  Declined: "destructive",
}

export default async function LyricsSuggestionsPage({ searchParams }: PageProps) {
  const { page: pageParam, tab } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)
  const isAI = tab === "ai"
  const PAGE_SIZE = 50

  const where = isAI
    ? { aiLyrics: { not: null } }
    : { lyricsSuggestion: { not: null } }

  const [hymns, total] = await Promise.all([
    prisma.hmHymn.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        singer: true,
        lyricsSuggestion: true,
        aiLyrics: true,
        approvalStatus: { select: { name: true } },
      },
    }),
    prisma.hmHymn.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const tabClass = (active: boolean) =>
    cn(
      "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    )
  const linkClass = "px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageHeader title="Lyrics suggestions" description={`${total.toLocaleString()} pending`} />

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <Link href="/hymns/admin/lyrics-suggestions" className={tabClass(!isAI)}>
          User suggestions
        </Link>
        <Link href="/hymns/admin/lyrics-suggestions?tab=ai" className={tabClass(isAI)}>
          AI suggestions
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">#</TableHead>
                <TableHead className="px-4">Title</TableHead>
                <TableHead className="hidden px-4 sm:table-cell">Singer</TableHead>
                <TableHead className="hidden px-4 md:table-cell">Status</TableHead>
                <TableHead className="px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {hymns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                    No {isAI ? "AI" : ""} lyrics suggestions
                  </TableCell>
                </TableRow>
              )}
              {hymns.map((hymn, index) => (
                <TableRow key={hymn.id}>
                  <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className="px-4">
                    <p className="line-clamp-1 font-medium">{hymn.title}</p>
                  </TableCell>
                  <TableCell className="hidden px-4 text-muted-foreground sm:table-cell">{hymn.singer ?? "—"}</TableCell>
                  <TableCell className="hidden px-4 md:table-cell">
                    <Badge variant={statusVariant[hymn.approvalStatus.name] ?? "secondary"}>
                      {hymn.approvalStatus.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <LyricsSuggestionActions
                      hymnId={hymn.id}
                      hymnTitle={hymn.title}
                      lyricsSuggestion={isAI ? (hymn.aiLyrics ?? "") : (hymn.lyricsSuggestion ?? "")}
                      type={isAI ? "ai" : "user"}
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
            <Link href={`/hymns/admin/lyrics-suggestions?tab=${tab ?? ""}&page=${page - 1}`} className={linkClass}>
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/hymns/admin/lyrics-suggestions?tab=${tab ?? ""}&page=${page + 1}`} className={linkClass}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
