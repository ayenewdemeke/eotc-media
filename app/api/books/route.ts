import { NextRequest, NextResponse } from 'next/server'
import { getBooks } from '@/lib/api/books'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const { searchParams } = req.nextUrl

  const page = parseInt(searchParams.get('page') ?? '1') || 1
  const limit = parseInt(searchParams.get('limit') ?? '24') || 24
  const languageId = searchParams.get('language') ? parseInt(searchParams.get('language')!) || undefined : undefined
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) || undefined : undefined
  const subCategoryId = searchParams.get('subCategory') ? parseInt(searchParams.get('subCategory')!) || undefined : undefined
  const sort = searchParams.get('sort') ?? undefined
  const view = searchParams.get('view') as 'my-books' | undefined
  const search = searchParams.get('search') ?? undefined

  const { books, total } = await getBooks({ page, limit, languageId, categoryId, subCategoryId, sort, userId, view, search })
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({ books, total, totalPages })
}
