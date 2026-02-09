import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Public list of roles
export async function GET() {
  try {
    const roles = await prisma.ltRole.findMany({
      orderBy: { orderIndex: "asc" },
    })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
