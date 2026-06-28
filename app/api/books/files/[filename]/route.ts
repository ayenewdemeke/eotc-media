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

    const object = await getObject(`books/files/${sanitized}`)
    if (!object) {
      return new NextResponse("File not found", { status: 404 })
    }

    return new NextResponse(object.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${sanitized}"`,
        "Content-Length": object.contentLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Internal server error", { status: 500 })
  }
}
