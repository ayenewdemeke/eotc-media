import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const sanitized = path.basename(filename)
    const filePath = path.join(process.cwd(), "storage", "uploads", "books", "files", sanitized)

    if (!existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 })
    }

    const [fileBuffer, fileStat] = await Promise.all([readFile(filePath), stat(filePath)])

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${sanitized}"`,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Internal server error", { status: 500 })
  }
}
