import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Public list of all sections
export async function GET() {
  try {
    const sections = await prisma.ltSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { texts: true },
        },
      },
    })

    return NextResponse.json({ sections })
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
