import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// GET: Get single section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasLiturgyAdminAccess(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const sectionId = parseInt(id)

    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    const section = await prisma.ltSection.findUnique({
      where: { id: sectionId },
      include: {
        texts: {
          orderBy: { orderIndex: "asc" },
        },
      },
    })

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    return NextResponse.json({ section })
  } catch (error) {
    console.error("Error fetching section:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasLiturgyAdminAccess(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const sectionId = parseInt(id)

    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    const body = await request.json()
    const { nameGeez, nameAmharic, nameEnglish, orderIndex } = body

    const existingSection = await prisma.ltSection.findUnique({
      where: { id: sectionId },
    })

    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    const section = await prisma.ltSection.update({
      where: { id: sectionId },
      data: {
        ...(nameGeez && { nameGeez }),
        ...(nameAmharic && { nameAmharic }),
        ...(nameEnglish && { nameEnglish }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    })

    return NextResponse.json({ section })
  } catch (error) {
    console.error("Error updating section:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasLiturgyAdminAccess(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const sectionId = parseInt(id)

    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    const existingSection = await prisma.ltSection.findUnique({
      where: { id: sectionId },
    })

    if (!existingSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    const textsCount = await prisma.ltLiturgicalText.count({
      where: { sectionId },
    })

    if (textsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete section. It has ${textsCount} text(s). Delete texts first.`,
        },
        { status: 400 }
      )
    }

    await prisma.ltSection.delete({
      where: { id: sectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting section:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
