import { NextRequest, NextResponse } from 'next/server'
import { getRandomQuestions } from '@/lib/api/quiz'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) || undefined : undefined
  const languageId = searchParams.get('language') ? parseInt(searchParams.get('language')!) || undefined : undefined
  const difficultyId = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) || undefined : undefined
  const count = Math.min(50, Math.max(1, parseInt(searchParams.get('count') ?? '10') || 10))

  const questions = await getRandomQuestions({ categoryId, languageId, difficultyId, count })
  return NextResponse.json({ questions })
}
