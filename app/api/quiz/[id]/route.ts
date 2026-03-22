import { NextRequest, NextResponse } from 'next/server'
import { getQuestion } from '@/lib/api/quiz'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const questionId = parseInt(id)
  if (!questionId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const question = await getQuestion(questionId)
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(question)
}
