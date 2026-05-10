import { prisma } from "@/lib/prisma"
import { VerseCorrectionsClient } from "@/components/admin/bible/VerseCorrectionsClient"

export default async function VerseCorrectionsPage() {
  const [books, translations] = await Promise.all([
    prisma.blBook.findMany({ orderBy: { id: "asc" } }),
    prisma.blTranslation.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="p-6">
      <VerseCorrectionsClient books={books} translations={translations} />
    </div>
  )
}
