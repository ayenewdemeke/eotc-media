import type { Metadata } from "next"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import { LiturgyReader } from "@/components/liturgy/LiturgyReader"

// Rendered per request so the build never needs the DB, but the liturgy content
// — identical for everyone and admin-edited only — is cached for 30 min via
// unstable_cache, so repeat/bot traffic doesn't re-query the DB every time.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Liturgy (Kidase) — Ethiopian Orthodox Divine Liturgy | ቅዳሴ",
  description:
    "Follow the Ethiopian Orthodox Tewahedo Church Divine Liturgy (Kidase) texts with role-by-role readings. " +
    "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን የቅዳሴ ጸሎቶች እና ሥርዓት።",
  keywords: [
    "Ethiopian Orthodox liturgy", "Kidase", "Divine Liturgy Ethiopia", "Orthodox Tewahedo Kidase",
    "ቅዳሴ", "ሥርዓተ ቅዳሴ", "የቅዳሴ ጸሎቶች",
  ],
  alternates: { canonical: "/liturgy" },
  openGraph: {
    title: "Liturgy (Kidase) — Ethiopian Orthodox Divine Liturgy | ቅዳሴ",
    description: "Follow the EOTC Divine Liturgy (Kidase) texts. ሥርዓተ ቅዳሴ።",
    url: "/liturgy",
  },
}

const getLiturgyData = unstable_cache(
  async () => {
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
  },
  ["liturgy-data"],
  { revalidate: 1800 }
)

export default async function LiturgyPage() {
  const { sections, roles } = await getLiturgyData()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <LiturgyReader sections={sections} roles={roles} />
      </div>
    </div>
  )
}
