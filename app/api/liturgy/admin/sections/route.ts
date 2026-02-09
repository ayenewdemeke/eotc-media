import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// GET: List all sections with pagination and filtering
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
    const sortBy = searchParams.get("sortBy") || "orderIndex"
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc"

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nameGeez: { contains: search, mode: "insensitive" } },
        { nameAmharic: { contains: search, mode: "insensitive" } },
        { nameEnglish: { contains: search, mode: "insensitive" } },
      ]
    }

    const [sections, total] = await Promise.all([
      prisma.ltSection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { texts: true },
          },
        },
      }),
      prisma.ltSection.count({ where }),
    ])

    return NextResponse.json({
      sections,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create new section
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
    const { nameGeez, nameAmharic, nameEnglish, orderIndex } = body

    // Validation
    if (!nameGeez || !nameAmharic || !nameEnglish) {
      return NextResponse.json(
        { error: "nameGeez, nameAmharic, and nameEnglish are required" },
        { status: 400 }
      )
    }

    const section = await prisma.ltSection.create({
      data: {
        nameGeez,
        nameAmharic,
        nameEnglish,
        orderIndex: orderIndex || 0,
      },
    })

    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
