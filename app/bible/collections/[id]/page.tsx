import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getBooks } from "@/lib/api/bible"
import Navbar from "@/components/Navbar"
import BibleCollectionDetailView from "@/components/bible/BibleCollectionDetailView"

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const { id } = await params
  const userId = parseInt(session.user.id)
  const collectionId = parseInt(id)
  if (isNaN(collectionId)) notFound()

  const [{ books }, collection] = await Promise.all([
    getBooks(),
    prisma.blCollection.findFirst({
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
    }),
  ])

  if (!collection) notFound()

  const verses = collection.verses.map(cv => ({
    verseId: cv.verse.id,
    bookId: cv.verse.book.id,
    bookEnglishName: cv.verse.book.englishName,
    bookAmharicName: cv.verse.book.amharicName,
    chapter: cv.verse.chapter,
    verseNum: cv.verse.verse,
    text: cv.verse.texts[0]?.text ?? "",
  }))

  return (
    <>
      <Navbar />
      <BibleCollectionDetailView
        books={books}
        collection={{ id: collection.id, name: collection.name, verses }}
      />
    </>
  )
}
