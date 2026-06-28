import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { getObject } from "@/lib/storage"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const sanitized = path.basename(filename)

    const object = await getObject(`books/images/${sanitized}`)
    if (!object) {
      return new NextResponse("Image not found", { status: 404 })
    }

    const ext = path.extname(sanitized).toLowerCase()
    const contentType: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }

    return new NextResponse(object.body, {
      headers: {
        "Content-Type": contentType[ext] ?? object.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Internal server error", { status: 500 })
  }
}
