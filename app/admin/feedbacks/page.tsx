import { prisma } from "@/lib/prisma"
import { MessageCircle } from "lucide-react"

export default async function AdminFeedbacksPage() {
  const feedbacks = await prisma.contactUs.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-neutral-500" />
        <h1 className="text-xl font-bold text-neutral-900">Feedbacks</h1>
        <span className="ml-1 text-sm text-neutral-400">({feedbacks.length})</span>
      </div>

      {feedbacks.length === 0 && (
        <p className="text-sm text-neutral-400">No feedbacks yet.</p>
      )}

      <div className="space-y-3">
        {feedbacks.map(f => (
          <div key={f.id} className="bg-white border border-neutral-100 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 flex-shrink-0">
                  {(f.name || f.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">{f.name || "Anonymous"}</p>
                  {f.email && <p className="text-xs text-neutral-400">{f.email}</p>}
                  {f.phone && <p className="text-xs text-neutral-400">{f.phone}</p>}
                </div>
              </div>
              <span className="text-xs text-neutral-400 flex-shrink-0">
                {new Date(f.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{f.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
