import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { putObject } from "@/lib/storage"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// POST: Upload audio file
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasLiturgyAdminAccess(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const textId = formData.get("textId") as string | null
    const audioType = formData.get("audioType") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: MP3, WAV, OGG, WebM" },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "mp3"
    const prefix = textId && audioType ? `${textId}_${audioType}` : "audio"
    const filename = `${prefix}_${timestamp}.${extension}`

    // Save file to R2 under liturgy/audio/<filename>
    const buffer = Buffer.from(await file.arrayBuffer())
    await putObject(`liturgy/audio/${filename}`, buffer, file.type || "audio/mpeg")

    return NextResponse.json({
      success: true,
      filename,
      path: `/api/liturgy/audio/${filename}`,
    })
  } catch (error) {
    console.error("Error uploading audio:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
