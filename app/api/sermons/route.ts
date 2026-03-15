import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSermons } from '@/lib/api/sermons'

const PAGE_SIZE = 24

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
  const category = searchParams.get('category')
  const subCategory = searchParams.get('subCategory')
  const language = searchParams.get('language')
  const preacher = searchParams.get('preacher')
  const channel = searchParams.get('channel')
  const search = searchParams.get('search') ?? undefined
  const sort = searchParams.get('sort') ?? undefined
  const view = searchParams.get('view') ?? undefined

  const categoryId = category ? parseInt(category) || undefined : undefined
  const subCategoryId = subCategory ? parseInt(subCategory) || undefined : undefined
  const languageId = language ? parseInt(language) || undefined : undefined
  const preacherId = preacher ? parseInt(preacher) || undefined : undefined
  const channelId = channel ? parseInt(channel) || undefined : undefined

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  if (view === 'favorites' && !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sermons, total } = await getSermons({
    page, categoryId, subCategoryId, languageId, preacherId, channelId,
    userId, search, view, sort,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)
  return NextResponse.json({ sermons, total, page, totalPages })
}
