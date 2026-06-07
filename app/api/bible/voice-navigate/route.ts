import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { transcript, language, version } = body as { transcript?: string; language?: string; version?: string }

  if (!transcript?.trim()) return NextResponse.json({ error: 'No transcript provided' }, { status: 422 })
  if (!language || !version) return NextResponse.json({ error: 'language and version are required' }, { status: 422 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const books = await prisma.blBook.findMany({ orderBy: { id: 'asc' } })

  const bookList = books
    .map(b => `${b.id}\t${b.englishName}${b.amharicName ? ` / ${b.amharicName}` : ''}${b.oromifaName ? ` / ${b.oromifaName}` : ''}`)
    .join('\n')

  const prompt = `You are a Bible reference parser. Extract the Bible reference from the user's voice input.

User said: "${transcript}"

Available books (format: id TAB english / amharic / oromifa names):
${bookList}

Instructions:
- Match the spoken book name to the closest entry in the list above (the user may speak in English, Amharic, or Oromifa)
- Extract the chapter number and optionally a verse number
- Return ONLY valid JSON with no markdown, no explanation
- If no clear Bible reference is found, return: {"error": "no reference found"}

Return format: {"bookId": <number>, "chapter": <number>, "verse": <number or null>}`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim().replace(/```json\n?|\n?```/g, '').trim()

    const parsed = JSON.parse(text)

    if (parsed.error || !parsed.bookId || !parsed.chapter) {
      return NextResponse.json(
        { error: 'Could not understand the reference. Try saying e.g. "John chapter 3" or "Genesis 5:1"' },
        { status: 422 }
      )
    }

    const book = books.find(b => b.id === Number(parsed.bookId))
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 422 })

    const url = `/bible/${language}/${version}/${parsed.bookId}/${parsed.chapter}${parsed.verse ? `?verse=${parsed.verse}` : ''}`

    return NextResponse.json({ url, bookName: book.englishName, chapter: parsed.chapter, verse: parsed.verse ?? null })
  } catch {
    return NextResponse.json({ error: 'Could not parse the reference. Please try again.' }, { status: 422 })
  }
}
