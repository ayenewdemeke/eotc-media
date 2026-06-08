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

  const prompt = `You are a Bible navigator. Handle two types of requests:

TYPE 1 — Direct reference: user names a specific book, chapter, or verse.
Examples: "John 3:16", "Genesis chapter 5", "ዮሐንስ ምዕራፍ 3 ቁጥር 16", "Yohannis 3"

TYPE 2 — Thematic/topical: user asks for a verse about a theme, emotion, or situation.
Examples: "verse about patience", "something consoling during hardships", "hope in difficult times", "ስለ ፍቅር", "give me a verse that encourages me"

For either type, identify the single most fitting Bible verse and return its location.

Available books (id TAB names):
${bookList}

User said: "${transcript}"

Rules:
- For direct references: match the spoken book name to the list above (user may speak English, Amharic, or Oromifa)
- For thematic requests: use your knowledge of well-known Bible passages; prefer clear, widely-known verses; always include a specific verse number
- Return ONLY valid JSON, no markdown, no explanation

Return format: {"bookId": <number>, "chapter": <number>, "verse": <number or null>}
If no verse can be determined: {"error": "no verse found"}`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim().replace(/```json\n?|\n?```/g, '').trim()

    const parsed = JSON.parse(text)

    if (parsed.error || !parsed.bookId || !parsed.chapter) {
      return NextResponse.json(
        { error: 'Could not find a matching verse. Try saying a book name or a topic like "verse about hope".' },
        { status: 422 }
      )
    }

    const book = books.find(b => b.id === Number(parsed.bookId))
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 422 })

    const url = `/bible/${language}/${version}/${parsed.bookId}/${parsed.chapter}${parsed.verse ? `?verse=${parsed.verse}` : ''}`

    return NextResponse.json({ url, bookName: book.englishName, chapter: parsed.chapter, verse: parsed.verse ?? null })
  } catch {
    return NextResponse.json({ error: 'Could not parse the response. Please try again.' }, { status: 422 })
  }
}
