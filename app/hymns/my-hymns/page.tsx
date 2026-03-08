import type { Metadata } from "next"
import { auth } from "@/auth"
import { getHymns } from "@/lib/api/hymns"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import HymnMyList from "@/components/hymns/HymnMyList"

export const metadata: Metadata = { title: "My Hymns — EOTC Media" }

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MyHymnsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const { hymns, total } = await getHymns({ page, userId, view: "my-hymns" })
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildPageUrl(p: number) {
    return p > 1 ? `/hymns/my-hymns?page=${p}` : "/hymns/my-hymns"
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <HymnMyList hymns={hymns} total={total} page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
          </main>
        </div>
      </div>
    </div>
  )
}
