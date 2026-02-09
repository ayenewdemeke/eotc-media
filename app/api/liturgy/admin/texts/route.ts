import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// GET: List all liturgical texts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasLiturgyAdminAccess(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sectionId = searchParams.get("sectionId")
    const roleId = searchParams.get("roleId")
    const sortBy = searchParams.get("sortBy") || "orderIndex"
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc"

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { textGeez: { contains: search, mode: "insensitive" } },
        { textAmharic: { contains: search, mode: "insensitive" } },
        { textEnglishTranslation: { contains: search, mode: "insensitive" } },
      ]
    }

    if (sectionId) {
      where.sectionId = parseInt(sectionId)
    }

    if (roleId) {
      where.roleId = parseInt(roleId)
    }

    const [texts, total] = await Promise.all([
      prisma.ltLiturgicalText.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
      }),
      prisma.ltLiturgicalText.count({ where }),
    ])

    return NextResponse.json({
      texts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching texts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create new liturgical text
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasLiturgyAdminAccess(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

    // Validation
    if (!sectionId || !roleId) {
      return NextResponse.json(
        { error: "sectionId and roleId are required" },
        { status: 400 }
      )
    }

    if (!textGeez || !textAmharic || !textEnglishTransliteration || !textEnglishTranslation) {
      return NextResponse.json(
        { error: "All text fields are required" },
        { status: 400 }
      )
    }

    // Verify section exists
    const section = await prisma.ltSection.findUnique({
      where: { id: sectionId },
    })

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 400 })
    }

    // Verify role exists
    const role = await prisma.ltRole.findUnique({
      where: { id: roleId },
    })

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 400 })
    }

    const text = await prisma.ltLiturgicalText.create({
      data: {
        sectionId,
        roleId,
        orderIndex: orderIndex || 0,
        textGeez,
        textAmharic,
        textEnglishTransliteration,
        textEnglishTranslation,
        remark: remark || null,
        audioGeezFilePath: audioGeezFilePath || null,
        audioEzilFilePath: audioEzilFilePath || null,
        audioArarayFilePath: audioArarayFilePath || null,
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

    return NextResponse.json({ text }, { status: 201 })
  } catch (error) {
    console.error("Error creating text:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
