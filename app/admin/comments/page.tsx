import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"

export default async function AdminCommentsPage() {
  const comments = await prisma.hmComment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      hymn: { select: { id: true, title: true, slug: true, thumbnailDefault: true } },
    },
  })

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageHeader title="Comments" description={`${comments.length.toLocaleString()} hymn comment${comments.length !== 1 ? "s" : ""}`} />

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      <div className="space-y-3">
        {comments.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4">
              {/* Hymn row */}
              <Link
                href={`/hymns/${c.hymn.slug}`}
                className="mb-3 flex items-center gap-3 group"
                target="_blank"
              >
                <Image
                  src={c.hymn.thumbnailDefault}
                  alt={c.hymn.title}
                  width={64}
                  height={36}
                  className="rounded flex-shrink-0 object-cover"
                />
                <span className="text-sm font-medium text-foreground group-hover:underline line-clamp-1">
                  {c.hymn.title}
                </span>
              </Link>

              {/* Comment row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {(c.user.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">{c.user.name}</p>
                    <p className="text-sm leading-relaxed text-foreground">{c.comment}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
