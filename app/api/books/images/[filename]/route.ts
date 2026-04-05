import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const sanitized = path.basename(filename)
    const filePath = path.join(process.cwd(), "storage", "uploads", "books", "images", sanitized)

    if (!existsSync(filePath)) {
      return new NextResponse("Image not found", { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const ext = path.extname(sanitized).toLowerCase()
    const contentType: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Internal server error", { status: 500 })
  }
}
