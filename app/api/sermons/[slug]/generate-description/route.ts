import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { fetchTranscript } from '@/lib/generate-lyrics'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const { slug } = await params
  const sermonId = parseInt(slug)

  const sermon = await prisma.smSermon.findFirst({
    where: { id: sermonId, userId },
    select: { videoId: true },
  })
  if (!sermon) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rawText = await fetchTranscript(sermon.videoId)
  if (!rawText) return NextResponse.json({ error: 'No subtitles found for this video' }, { status: 422 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are given raw subtitle text from a religious sermon video. Write a concise description (2-4 sentences) summarizing the main topic and message of the sermon. Preserve the original language. Output only the description, no extra commentary.

Raw subtitle text:
${rawText}`

  const result = await model.generateContent(prompt)
  const description = result.response.text().trim()

  return NextResponse.json({ description })
}
