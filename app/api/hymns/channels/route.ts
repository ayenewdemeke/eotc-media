import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const PAGE_SIZE = 24

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1)
  const sortBy = searchParams.get("sortBy") === "hymns" ? "hymns" : "title"
  const sortOrder = (searchParams.get("sortOrder") === "desc" ? "desc" : "asc") as const

  const orderBy = sortBy === "hymns"
    ? { hymns: { _count: sortOrder } }
    : { title: sortOrder }

  const [channels, total] = await Promise.all([
    prisma.hmChannel.findMany({
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { hymns: true } } },
    }),
    prisma.hmChannel.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  return NextResponse.json({ channels, total, page, totalPages })
}
