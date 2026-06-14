import Link from "next/link"
import { SmSermon } from "@/types/models/sermon"
import { Video, Plus } from "lucide-react"
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

interface SermonMyListProps {
  sermons: SmSermon[]
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

export default function SermonMyList({ sermons, total, page, totalPages, baseUrl }: SermonMyListProps) {
  const PAGE_SIZE = 20

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My sermons</h2>
          <p className="text-xs text-muted-foreground">{total.toLocaleString()} sermon{total !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/sermons/submit">
            <Plus className="h-4 w-4" />
            Submit sermon
          </Link>
        </Button>
      </div>

      <Pager page={page} totalPages={totalPages} baseUrl={baseUrl} />

      {sermons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Video className="mb-4 h-12 w-12 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold">No sermons yet</p>
          <p className="mt-1 text-sm opacity-60">Submit your first sermon above</p>
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
                  <TableHead className="px-4">Title</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="w-16 px-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sermons.map((sermon, i) => (
                  <TableRow key={sermon.id}>
                    <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                    <TableCell className="px-4 text-xs text-muted-foreground">{sermon.languages?.map(l => l.name).join(", ") || "—"}</TableCell>
                    <TableCell className="px-4 text-xs text-muted-foreground">{sermon.categories?.map(c => c.name).join(", ") || "—"}</TableCell>
                    <TableCell className="px-4 text-xs text-muted-foreground">{sermon.subCategories?.map(s => s.name).join(", ") || "—"}</TableCell>
                    <TableCell className="px-4 font-medium">
                      {sermon.title.length > 40 ? sermon.title.slice(0, 40) + "…" : sermon.title}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant={statusVariant[sermon.approvalStatus?.name ?? ""] ?? "secondary"}>
                        {sermon.approvalStatus?.name ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4">
                      <Link href={`/sermons/my-sermons/${sermon.id}`} className="text-xs font-medium text-primary hover:underline">
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
