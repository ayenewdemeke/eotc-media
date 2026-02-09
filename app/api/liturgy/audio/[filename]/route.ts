import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename)
    const filePath = path.join(
      process.cwd(),
      "storage",
      "uploads",
      "liturgy",
      "audio",
      sanitizedFilename
    )

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse("Audio file not found", { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

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

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error serving audio:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
