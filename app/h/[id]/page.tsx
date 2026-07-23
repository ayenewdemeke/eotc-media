import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

// Short share link: /h/123 → the canonical /hymns/<slug> page.
// Keeps shared URLs compact instead of the long percent-encoded Amharic slug.
export const dynamic = "force-dynamic"

export default async function ShortHymnLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const n = parseInt(id)
  if (!Number.isInteger(n)) notFound()

  const hymn = await prisma.hmHymn.findUnique({ where: { id: n }, select: { slug: true } })
  if (!hymn) notFound()

  redirect(`/hymns/${hymn.slug}`)
}
