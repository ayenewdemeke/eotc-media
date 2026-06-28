import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 60

let genAI: GoogleGenerativeAI | null = null
let cachedBooks: { id: number; englishName: string; amharicName: string | null; oromifaName: string | null }[] | null = null
let cachedBookList: string | null = null

export async function POST(req: NextRequest) {
  let language: string | undefined
  let version: string | undefined
  let audioBase64: string | undefined
  let audioMimeType = "audio/webm"

  try {
    const formData = await req.formData()
    language = (formData.get("language") as string) || undefined
    version = (formData.get("version") as string) || undefined
    const audioFile = formData.get("audio") as File | null
    if (audioFile) {
      audioMimeType = (audioFile.type || "audio/webm").split(";")[0]
      const bytes = await audioFile.arrayBuffer()
      audioBase64 = Buffer.from(bytes).toString("base64")
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!audioBase64) return NextResponse.json({ error: 'No audio provided' }, { status: 422 })
  if (!language || !version) return NextResponse.json({ error: 'language and version are required' }, { status: 422 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  if (!genAI) genAI = new GoogleGenerativeAI(apiKey)

  if (!cachedBooks) {
    cachedBooks = await prisma.blBook.findMany({ orderBy: { id: 'asc' } })
    cachedBookList = cachedBooks
      .map(b => `${b.id}\t${b.englishName}${b.amharicName ? ` / ${b.amharicName}` : ''}${b.oromifaName ? ` / ${b.oromifaName}` : ''}`)
      .join('\n')
  }
  const books = cachedBooks
  const bookList = cachedBookList!

  const prompt = `You are a Bible navigator. Listen to the audio and handle two request types:

TYPE 1 — Direct reference: user names a specific book, chapter, or verse.
Examples: "John 3:16", "Genesis chapter 5", "ዮሐንስ ምዕራፍ 3 ቁጥር 16", "Yohannis 3"

TYPE 2 — Thematic/topical: user asks for a verse about a theme, emotion, or situation.
Examples: "verse about patience", "something consoling during hardships", "ስለ ፍቅር"

The user may be speaking in English, Amharic, or Oromifa. Identify the single most fitting Bible verse.

Available books (id TAB names):
${bookList}

Rules:
- For direct references: match the spoken book name to the list above
- For thematic requests: use your knowledge of well-known Bible passages; always include a specific verse number
- Return ONLY valid JSON, no markdown, no explanation

Return format: {"bookId": <number>, "chapter": <number>, "verse": <number or null>}
If nothing intelligible or no verse found: {"error": "no verse found"}`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([
      { inlineData: { mimeType: audioMimeType, data: audioBase64 } },
      { text: prompt },
    ])
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
    return NextResponse.json({ error: 'Could not process the audio. Please try again.' }, { status: 422 })
  }
}
