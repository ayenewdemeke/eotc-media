import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"

export default async function AdminFeedbacksPage() {
  const feedbacks = await prisma.contactUs.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageHeader title="Feedbacks" description={`${feedbacks.length.toLocaleString()} messages`} />

      {feedbacks.length === 0 && (
        <p className="text-sm text-muted-foreground">No feedbacks yet.</p>
      )}

      <div className="space-y-3">
        {feedbacks.map(f => (
          <Card key={f.id}>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {(f.name || f.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.name || "Anonymous"}</p>
                    {f.email && <p className="text-xs text-muted-foreground">{f.email}</p>}
                    {f.phone && <p className="text-xs text-muted-foreground">{f.phone}</p>}
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{f.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
