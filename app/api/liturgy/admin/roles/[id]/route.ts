import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

// GET: Get single role by ID
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
    const roleId = parseInt(id)

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
    }

    const role = await prisma.ltRole.findUnique({
      where: { id: roleId },
    })

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Error fetching role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update role
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
    const roleId = parseInt(id)

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
    }

    const body = await request.json()
    const { roleKey, nameAmharic, nameEnglish, orderIndex } = body

    // Check if role exists
    const existingRole = await prisma.ltRole.findUnique({
      where: { id: roleId },
    })

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // If roleKey is being changed, check for duplicates
    if (roleKey && roleKey !== existingRole.roleKey) {
      const duplicateRole = await prisma.ltRole.findUnique({
        where: { roleKey },
      })

      if (duplicateRole) {
        return NextResponse.json(
          { error: "A role with this key already exists" },
          { status: 400 }
        )
      }
    }

    const role = await prisma.ltRole.update({
      where: { id: roleId },
      data: {
        ...(roleKey && { roleKey }),
        ...(nameAmharic && { nameAmharic }),
        ...(nameEnglish && { nameEnglish }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    })

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete role
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
    const roleId = parseInt(id)

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
    }

    // Check if role exists
    const existingRole = await prisma.ltRole.findUnique({
      where: { id: roleId },
    })

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Check if role is being used by any texts
    const textsUsingRole = await prisma.ltLiturgicalText.count({
      where: { roleId },
    })

    if (textsUsingRole > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete role. It is being used by ${textsUsingRole} liturgical text(s).`,
        },
        { status: 400 }
      )
    }

    await prisma.ltRole.delete({
      where: { id: roleId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
