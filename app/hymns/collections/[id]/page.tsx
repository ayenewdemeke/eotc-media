import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getHymns } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnInfiniteGrid from "@/components/hymns/HymnInfiniteGrid"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const collection = await prisma.hmCollection.findFirst({
    where: { id: parseInt(id) || 0 },
    select: { name: true },
  })
  return { title: collection ? `${collection.name} — My Lists | EOTC Media` : "My Lists | EOTC Media" }
}

export default async function CollectionDetailPage({ params, searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { id } = await params
  const { sort } = await searchParams
  const collectionId = parseInt(id) || 0

  const collection = await prisma.hmCollection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true, name: true, _count: { select: { hymns: true } } },
  })
  if (!collection) notFound()

  const { hymns, total } = await getHymns({ view: "collection", collectionId, userId, sort })
  const totalPages = Math.ceil(total / 24)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-5">
              <a href="/hymns/collections" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                ← My Lists
              </a>
              <h1 className="text-xl font-semibold text-slate-900 mt-1">{collection.name}</h1>
            </div>
            <HymnInfiniteGrid
              initialHymns={hymns}
              initialTotal={total}
              initialTotalPages={totalPages}
              filters={{ view: "collection", collection: String(collectionId), sort }}
              userId={userId}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
