import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkMainAdminAccess } from "@/lib/auth-helpers"

export async function GET() {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const items = await prisma.featuredItem.findMany({ orderBy: { orderBy: "asc" } })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const { moduleType, itemId, name, orderBy } = await req.json()
  if (!["hymn", "sermon"].includes(moduleType)) return NextResponse.json({ error: "Invalid module type" }, { status: 400 })
  if (!itemId || typeof itemId !== "number") return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })

  // Verify the item exists
  if (moduleType === "hymn") {
    const hymn = await prisma.hmHymn.findUnique({ where: { id: itemId } })
    if (!hymn) return NextResponse.json({ error: "Hymn not found" }, { status: 404 })
  } else {
    const sermon = await prisma.smSermon.findUnique({ where: { id: itemId } })
    if (!sermon) return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
  }

  const item = await prisma.featuredItem.create({
    data: { moduleType, itemId, name: name || "", orderBy: orderBy ?? 0 },
  })
  return NextResponse.json({ item }, { status: 201 })
}
