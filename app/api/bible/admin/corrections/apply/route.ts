import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkMainAdminAccess } from "@/lib/auth-helpers"

export async function POST(req: NextRequest) {
  const session = await auth()
  try { checkMainAdminAccess(session) } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  const { verseId, translationCode, newText } = await req.json()
  if (!verseId || !translationCode || typeof newText !== "string") {
    return NextResponse.json({ error: "verseId, translationCode, and newText are required" }, { status: 400 })
  }

  const translation = await prisma.blTranslation.findUnique({ where: { code: translationCode } })
  if (!translation) return NextResponse.json({ error: "Translation not found" }, { status: 404 })

  await prisma.blVerseText.upsert({
    where: { verseId_translationId: { verseId, translationId: translation.id } },
    update: { text: newText },
    create: { verseId, translationId: translation.id, text: newText },
  })

  return NextResponse.json({ ok: true })
}
