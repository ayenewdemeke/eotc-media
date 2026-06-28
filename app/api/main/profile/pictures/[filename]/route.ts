import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getObject } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Next.js 16: params is now a Promise and must be awaited
    const { filename } = await params;
    const sanitized = path.basename(filename);

    const object = await getObject(`profiles/${sanitized}`);
    if (!object) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Determine content type based on file extension
    const ext = path.extname(sanitized).toLowerCase();
    const contentType = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }[ext] || object.contentType;

    return new NextResponse(object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Image not found", { status: 404 });
  }
}
