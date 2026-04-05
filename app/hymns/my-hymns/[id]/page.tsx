import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import HymnSidebar from "@/components/hymns/HymnSidebar"
import { ArrowLeft } from "lucide-react"

const STATUS_STYLE: Record<string, { badge: string; label: string }> = {
  Accepted: { badge: "bg-green-100 text-green-700 border border-green-200", label: "Accepted" },
  Submitted: { badge: "bg-amber-100 text-amber-700 border border-amber-200", label: "Pending review" },
  Declined:  { badge: "bg-red-100 text-red-600 border border-red-200",       label: "Declined" },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MyHymnDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { id } = await params
  const hymnId = parseInt(id)
  if (!hymnId) notFound()

  const hymn = await prisma.hmHymn.findFirst({
    where: { id: hymnId, userId },
    include: {
      approvalStatus: true,
      categories: { include: { category: true } },
      languages: { include: { language: true } },
      subCategories: { include: { subCategory: true } },
      singers: { include: { singer: true } },
    },
  })
  if (!hymn) notFound()

  const statusName = (hymn.approvalStatus as { name: string } | null)?.name ?? "Submitted"
  const status = STATUS_STYLE[statusName] ?? { badge: "bg-slate-100 text-slate-600 border border-slate-200", label: statusName }

  const languages = (hymn.languages as { language: { id: number; name: string } }[])
  const categories = (hymn.categories as { category: { id: number; name: string } }[])
  const subCategories = (hymn.subCategories as { subCategory: { id: number; name: string } }[])
  const singers = (hymn.singers as { singer: { id: number; name: string } }[])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <HymnSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl">

              <Link href="/hymns/my-hymns" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                My hymns
              </Link>

              {/* Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

                <div className="p-6">

                  {/* Title + status badge */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <h1 className="text-xl font-bold text-slate-900 leading-snug">{hymn.title}</h1>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Meta rows */}
                  <dl className="space-y-3 mb-6">
                    {languages.length > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide pt-0.5">Language</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {languages.map(l => (
                            <span key={l.language.id} className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">{l.language.name}</span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {singers.length > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide pt-0.5">Singer</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {singers.map(s => (
                            <span key={s.singer.id} className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">{s.singer.name}</span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {categories.length > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide pt-0.5">Category</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {categories.map(c => (
                            <span key={c.category.id} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">{c.category.name}</span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {subCategories.length > 0 && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide pt-0.5">Subcategory</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {subCategories.map(sc => (
                            <span key={sc.subCategory.id} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 font-medium">{sc.subCategory.name}</span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="border-t border-slate-100" />

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Lyrics</p>
                    {hymn.lyrics ? (
                      <div
                        className="text-sm text-slate-800 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: hymn.lyrics as string }}
                      />
                    ) : (
                      <p className="text-sm text-slate-400 italic">No lyrics added</p>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
