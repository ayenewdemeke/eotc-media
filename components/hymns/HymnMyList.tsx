import Link from "next/link"
import { Music, Plus } from "lucide-react"
import { HmHymn } from "@/types/models/hymn"
import Pager from "@/components/ui/Pager"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface HymnMyListProps {
  hymns: HmHymn[]
  total: number
  page: number
  totalPages: number
  baseUrl: string
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  Accepted: "success",
  Submitted: "warning",
  Declined: "destructive",
}

export default function HymnMyList({ hymns, total, page, totalPages, baseUrl }: HymnMyListProps) {
  const PAGE_SIZE = 24

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My hymns</h2>
          <p className="text-xs text-muted-foreground">{total.toLocaleString()} hymn{total !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/hymns/submit">
            <Plus className="h-4 w-4" />
            Add hymn
          </Link>
        </Button>
      </div>

      <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />

      {hymns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Music className="mb-4 h-12 w-12 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold">No hymns yet</p>
          <p className="mt-1 text-sm opacity-60">Submit your first hymn above</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table className="whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">#</TableHead>
                  <TableHead className="px-4">Language</TableHead>
                  <TableHead className="px-4">Category</TableHead>
                  <TableHead className="px-4">Subcategory</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="w-16 px-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {hymns.map((hymn, i) => (
                  <TableRow key={hymn.id}>
                    <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="px-4 text-xs text-muted-foreground">{hymn.languages?.map(l => l.name).join(", ") || "—"}</TableCell>
                    <TableCell className="px-4 text-xs text-muted-foreground">{hymn.categories?.map(c => c.name).join(", ") || "—"}</TableCell>
                    <TableCell className="px-4 text-xs text-muted-foreground">{hymn.subCategories?.map(sc => sc.name).join(", ") || "—"}</TableCell>
                    <TableCell className="px-4">
                      <Badge variant={statusVariant[hymn.approvalStatus?.name ?? ""] ?? "secondary"}>
                        {hymn.approvalStatus?.name ?? "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      <Link href={`/hymns/my-hymns/${hymn.id}`} className="text-xs font-medium text-primary hover:underline">
                        view
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />
    </div>
  )
}
