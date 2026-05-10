import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getBooks } from "@/lib/api/bible"
import Navbar from "@/components/Navbar"
import BibleCollectionsView from "@/components/bible/BibleCollectionsView"

export default async function CollectionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const userId = parseInt(session.user.id)
  const [{ books }, collections] = await Promise.all([
    getBooks(),
    prisma.blCollection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { verses: true } } },
    }),
  ])

  return (
    <>
      <Navbar />
      <BibleCollectionsView books={books} collections={collections} />
    </>
  )
}
