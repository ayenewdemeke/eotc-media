import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getQuestions } from '@/lib/api/quiz'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) || undefined : undefined
  const subCategoryId = searchParams.get('subCategory') ? parseInt(searchParams.get('subCategory')!) || undefined : undefined
  const languageId = searchParams.get('language') ? parseInt(searchParams.get('language')!) || undefined : undefined
  const difficultyId = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) || undefined : undefined
  const search = searchParams.get('search') || undefined
  const view = searchParams.get('view') || undefined
  // batch mode: return all matching questions (up to 100) without pagination
  const batch = searchParams.get('batch') === '1'

  let userId: number | undefined
  if (view === 'my-questions') {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = parseInt(session.user.id)
  }

  const limit = batch ? 100 : 24

  const { questions, total } = await getQuestions({
    page: batch ? 1 : page,
    limit,
    categoryId, subCategoryId, languageId, difficultyId, search, view, userId,
  })
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({ questions, total, page: batch ? 1 : page, totalPages })
}
