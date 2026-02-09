import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Public list of liturgical texts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get("sectionId")

    const where: Record<string, unknown> = {}

    if (sectionId) {
      where.sectionId = parseInt(sectionId)
    }

    const texts = await prisma.ltLiturgicalText.findMany({
      where,
      orderBy: [
        { section: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
      include: {
        section: {
          select: {
            id: true,
            nameEnglish: true,
            nameAmharic: true,
            nameGeez: true,
            orderIndex: true,
          },
        },
        role: {
          select: {
            id: true,
            roleKey: true,
            nameEnglish: true,
            nameAmharic: true,
          },
        },
      },
    })

    return NextResponse.json({ texts })
  } catch (error) {
    console.error("Error fetching texts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
