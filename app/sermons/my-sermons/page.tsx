import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { getSermons } from "@/lib/api/sermons"
import Navbar from "@/components/Navbar"
import SermonSidebar from "@/components/sermons/SermonSidebar"
import SermonMyList from "@/components/sermons/SermonMyList"

export const metadata: Metadata = { title: "My Sermons | EOTC Media" }

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MySermonPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const { sermons, total } = await getSermons({ page, limit: PAGE_SIZE, userId, view: "my-sermons" })
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildPageUrl(p: number) {
    return `/sermons/my-sermons?page=${p}`
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <SermonSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-base font-semibold text-slate-900">My Sermons</h1>
              <Link
                href="/sermons/submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Submit Sermon
              </Link>
            </div>
            <SermonMyList
              sermons={sermons}
              page={page}
              totalPages={totalPages}
              buildPageUrl={buildPageUrl}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
