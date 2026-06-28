import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { getObject } from "@/lib/storage"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename)

    const object = await getObject(`liturgy/audio/${sanitizedFilename}`)
    if (!object) {
      return new NextResponse("Audio file not found", { status: 404 })
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    const contentType =
      {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".webm": "audio/webm",
        ".m4a": "audio/mp4",
      }[ext] || "audio/mpeg"

    return new NextResponse(object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": object.contentLength.toString(),
      },
    })
  } catch (error) {
    console.error("Error serving audio:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
