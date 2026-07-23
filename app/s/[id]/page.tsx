import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

// Short share link: /s/123 → the canonical /sermons/<slug> page.
export const dynamic = "force-dynamic"

export default async function ShortSermonLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const n = parseInt(id)
  if (!Number.isInteger(n)) notFound()

  const sermon = await prisma.smSermon.findUnique({ where: { id: n }, select: { slug: true } })
  if (!sermon) notFound()

  redirect(`/sermons/${sermon.slug}`)
}
