import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnCollectionsClient from "@/components/hymns/HymnCollectionsClient"

export const metadata: Metadata = { title: "My Lists — Hymns | EOTC Media" }

export default async function HymnCollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const collections = await prisma.hmCollection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { hymns: true } } },
  })

  const initial = collections.map(c => ({ id: c.id, name: c.name, hymnCount: c._count.hymns }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <HymnCollectionsClient initialCollections={initial} />
          </main>
        </div>
      </div>
    </div>
  )
}
