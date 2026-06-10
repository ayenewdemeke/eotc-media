import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { LiturgyReader } from "@/components/liturgy/LiturgyReader"

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
