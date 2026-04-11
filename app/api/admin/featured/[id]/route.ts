import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkMainAdminAccess } from "@/lib/auth-helpers"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const { id } = await params
  const { name, orderBy } = await req.json()
  const item = await prisma.featuredItem.update({
    where: { id: parseInt(id) },
    data: { name, orderBy },
  })
  return NextResponse.json({ item })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const { id } = await params
  await prisma.featuredItem.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
