import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkMainAdminAccess } from "@/lib/auth-helpers"

export async function GET(req: NextRequest) {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const { searchParams } = new URL(req.url)
  const bookId = parseInt(searchParams.get("bookId") ?? "", 10)
  if (isNaN(bookId)) return NextResponse.json({ error: "bookId is required" }, { status: 400 })

  const rows = await prisma.blVerse.findMany({
    where: { bookId },
    select: { chapter: true },
    distinct: ["chapter"],
    orderBy: { chapter: "asc" },
  })

  return NextResponse.json({ chapters: rows.map(r => r.chapter) })
}
