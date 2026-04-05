import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BookMarked, ChevronLeft, ExternalLink } from "lucide-react"

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const { id } = await params
  const userId = parseInt(session.user.id)
  const collectionId = parseInt(id)

  if (isNaN(collectionId)) notFound()

  const collection = await prisma.blCollection.findFirst({
    where: { id: collectionId, userId },
    include: {
      verses: {
        include: {
          verse: {
            include: {
              book: true,
              texts: {
                take: 1,
                where: { translation: { language: "am" } },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!collection) notFound()

  // Group verses by book and chapter
  type GroupedVerse = {
    bookId: number
    bookName: string
    chapter: number
    verseNum: number
    text: string
    verseId: number
  }

  const grouped = new Map<string, GroupedVerse[]>()
  for (const cv of collection.verses) {
    const v = cv.verse
    const bookName = v.book.amharicName ?? v.book.englishName
    const key = `${v.book.id}::${v.chapter}::${bookName}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push({
      bookId: v.book.id,
      bookName,
      chapter: v.chapter,
      verseNum: v.verse,
      text: v.texts[0]?.text ?? "",
      verseId: v.id,
    })
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/bible/collections"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          My collections
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{collection.name}</h1>
            <p className="text-sm text-slate-400">
              {collection.verses.length} verse{collection.verses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {collection.verses.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 text-sm">No verses in this collection yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...grouped.entries()].map(([key, verses]) => {
              const [, , bookName] = key.split("::")
              const { bookId, chapter } = verses[0]
              return (
                <div key={key} className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-700">
                      {bookName} {chapter}
                    </p>
                    <Link
                      href={`/bible/amharic/1954/${bookId}/${chapter}`}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {verses.map(v => (
                      <li key={v.verseId} className="px-5 py-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-blue-400 pt-0.5 shrink-0 w-5 text-right">
                            {v.verseNum}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed font-serif">
                            {v.text || <span className="text-slate-400 italic">[no text]</span>}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
