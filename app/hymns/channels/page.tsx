import type { Metadata } from "next"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import ChannelInfiniteGrid from "@/components/hymns/ChannelInfiniteGrid"

export const metadata: Metadata = { title: "Channels — Hymns | EOTC Media" }

const PAGE_SIZE = 24

export default async function ChannelsPage() {
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const [channels, total] = await Promise.all([
    prisma.hmChannel.findMany({
      orderBy: { title: "asc" },
      take: PAGE_SIZE,
      include: { _count: { select: { hymns: true } } },
    }),
    prisma.hmChannel.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">

          <HymnSidebar userId={userId} />

          <main className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-base font-semibold text-slate-900 mb-5">Channels</h1>
            <ChannelInfiniteGrid
              initialChannels={channels}
              initialTotal={total}
              initialTotalPages={totalPages}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
