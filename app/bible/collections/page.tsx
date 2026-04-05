import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BookMarked, ChevronRight } from "lucide-react"

export default async function CollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const userId = parseInt(session.user.id)
  const collections = await prisma.blCollection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { verses: true } },
    },
  })

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">My collections</h1>
          </div>
          <p className="text-sm text-slate-500">Your saved verse collections</p>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
            <BookMarked className="w-10 h-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
            <p className="font-semibold text-slate-500">No collections yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Open the Bible reader, select verses, and save them to a collection.
            </p>
            <Link
              href="/bible"
              className="inline-block mt-5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Bible
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {collections.map(col => (
              <Link
                key={col.id}
                href={`/bible/collections/${col.id}`}
                className="group flex items-center gap-4 p-5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {col.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {col._count.verses} verse{col._count.verses !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
