import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getHymns } from '@/lib/api/hymns'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) || undefined : undefined
  const subCategoryId = searchParams.get('subCategory') ? parseInt(searchParams.get('subCategory')!) || undefined : undefined
  const languageId = searchParams.get('language') ? parseInt(searchParams.get('language')!) || undefined : undefined
  const singerId = searchParams.get('singer') ? parseInt(searchParams.get('singer')!) || undefined : undefined
  const channelId = searchParams.get('channel') ? parseInt(searchParams.get('channel')!) || undefined : undefined
  const collectionId = searchParams.get('collection') ? parseInt(searchParams.get('collection')!) || undefined : undefined
  const search = searchParams.get('search') || undefined
  const sort = searchParams.get('sort') || undefined
  const view = searchParams.get('view') || undefined

  let userId: number | undefined
  if (view === 'favorites' || view === 'my-hymns' || view === 'collection') {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = parseInt(session.user.id)
  }

  const { hymns, total } = await getHymns({ page, categoryId, subCategoryId, languageId, singerId, channelId, search, sort, view, userId, collectionId })
  const totalPages = Math.ceil(total / 24)

  return NextResponse.json({ hymns, total, page, totalPages })
}
