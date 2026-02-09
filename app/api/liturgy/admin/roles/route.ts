import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// GET: List all roles with pagination
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

    const where = search
      ? {
          OR: [
            { roleKey: { contains: search, mode: "insensitive" as const } },
            { nameAmharic: { contains: search, mode: "insensitive" as const } },
            { nameEnglish: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [roles, total] = await Promise.all([
      prisma.ltRole.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.ltRole.count({ where }),
    ])

    return NextResponse.json({
      roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create new role
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
    const { roleKey, nameAmharic, nameEnglish, orderIndex } = body

    // Validation
    if (!roleKey || !nameAmharic || !nameEnglish) {
      return NextResponse.json(
        { error: "roleKey, nameAmharic, and nameEnglish are required" },
        { status: 400 }
      )
    }

    // Check if roleKey already exists
    const existingRole = await prisma.ltRole.findUnique({
      where: { roleKey },
    })

    if (existingRole) {
      return NextResponse.json(
        { error: "A role with this key already exists" },
        { status: 400 }
      )
    }

    const role = await prisma.ltRole.create({
      data: {
        roleKey,
        nameAmharic,
        nameEnglish,
        orderIndex: orderIndex || 0,
      },
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
