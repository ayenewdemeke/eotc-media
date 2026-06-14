import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasMainAdminAccess } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!hasMainAdminAccess(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  const users = await prisma.user.findMany({
    where: {
      emailOptOut: false,
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 100,
  })

  return NextResponse.json(users)
}
