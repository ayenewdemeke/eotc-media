import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { LiturgyReader } from "@/components/liturgy/LiturgyReader"

export const dynamic = "force-dynamic"

async function getLiturgyData() {
  const [sections, roles] = await Promise.all([
    prisma.ltSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        texts: {
          orderBy: { orderIndex: "asc" },
          include: { role: true },
        },
      },
    }),
    prisma.ltRole.findMany({
      orderBy: { orderIndex: "asc" },
    }),
  ])

  return { sections, roles }
}

export default async function LiturgyPage() {
  const { sections, roles } = await getLiturgyData()

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <LiturgyReader sections={sections} roles={roles} />
      </div>
      <Footer />
    </>
  )
}
