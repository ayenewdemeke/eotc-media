import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// GET: Get single liturgical text by ID
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
    const textId = parseInt(id)

    if (isNaN(textId)) {
      return NextResponse.json({ error: "Invalid text ID" }, { status: 400 })
    }

    const text = await prisma.ltLiturgicalText.findUnique({
      where: { id: textId },
      include: {
        section: {
          select: {
            id: true,
            nameEnglish: true,
          },
        },
        role: {
          select: {
            id: true,
            roleKey: true,
            nameEnglish: true,
          },
        },
      },
    })

    if (!text) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 })
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error fetching text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update liturgical text
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
    const textId = parseInt(id)

    if (isNaN(textId)) {
      return NextResponse.json({ error: "Invalid text ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      sectionId,
      roleId,
      orderIndex,
      textGeez,
      textAmharic,
      textEnglishTransliteration,
      textEnglishTranslation,
      remark,
      audioGeezFilePath,
      audioEzilFilePath,
      audioArarayFilePath,
    } = body

    const existingText = await prisma.ltLiturgicalText.findUnique({
      where: { id: textId },
    })

    if (!existingText) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 })
    }

    if (sectionId) {
      const section = await prisma.ltSection.findUnique({
        where: { id: sectionId },
      })
      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 400 })
      }
    }

    if (roleId) {
      const role = await prisma.ltRole.findUnique({
        where: { id: roleId },
      })
      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 400 })
      }
    }

    const text = await prisma.ltLiturgicalText.update({
      where: { id: textId },
      data: {
        ...(sectionId !== undefined && { sectionId }),
        ...(roleId !== undefined && { roleId }),
        ...(orderIndex !== undefined && { orderIndex }),
        ...(textGeez !== undefined && { textGeez }),
        ...(textAmharic !== undefined && { textAmharic }),
        ...(textEnglishTransliteration !== undefined && { textEnglishTransliteration }),
        ...(textEnglishTranslation !== undefined && { textEnglishTranslation }),
        ...(remark !== undefined && { remark: remark || null }),
        ...(audioGeezFilePath !== undefined && { audioGeezFilePath: audioGeezFilePath || null }),
        ...(audioEzilFilePath !== undefined && { audioEzilFilePath: audioEzilFilePath || null }),
        ...(audioArarayFilePath !== undefined && { audioArarayFilePath: audioArarayFilePath || null }),
      },
      include: {
        section: {
          select: {
            id: true,
            nameEnglish: true,
          },
        },
        role: {
          select: {
            id: true,
            nameEnglish: true,
          },
        },
      },
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error updating text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete liturgical text
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
    const textId = parseInt(id)

    if (isNaN(textId)) {
      return NextResponse.json({ error: "Invalid text ID" }, { status: 400 })
    }

    const existingText = await prisma.ltLiturgicalText.findUnique({
      where: { id: textId },
    })

    if (!existingText) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 })
    }

    await prisma.ltLiturgicalText.delete({
      where: { id: textId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
