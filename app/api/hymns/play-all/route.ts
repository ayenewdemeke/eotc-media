import { NextRequest, NextResponse } from "next/server"
import { getHymns } from "@/lib/api/hymns"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const view = searchParams.get("view") ?? undefined
  const languageId = searchParams.get("language") ? parseInt(searchParams.get("language")!) || undefined : undefined
  const categoryId = searchParams.get("category") ? parseInt(searchParams.get("category")!) || undefined : undefined
  const subCategoryId = searchParams.get("subCategory") ? parseInt(searchParams.get("subCategory")!) || undefined : undefined
  const singerId = searchParams.get("singer") ? parseInt(searchParams.get("singer")!) || undefined : undefined
  const channelId = searchParams.get("channel") ? parseInt(searchParams.get("channel")!) || undefined : undefined
  const collectionId = searchParams.get("collection") ? parseInt(searchParams.get("collection")!) || undefined : undefined
  const sort = searchParams.get("sort") ?? undefined
  const search = searchParams.get("search") ?? undefined

  const { hymns } = await getHymns({
    page: 1,
    limit: 200,
    view,
    languageId,
    categoryId,
    subCategoryId,
    singerId,
    channelId,
    collectionId,
    sort,
    search,
    userId,
  })

  return NextResponse.json({ hymns })
}
