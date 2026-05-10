import { GoogleGenerativeAI } from '@google/generative-ai'

export interface VerseScanInput {
  verseId: number
  verseNum: number
  text: string
}

export interface VerseSuggestion {
  verseId: number | null
  verseNum: number
  chapter: number
  originalText: string
  suggestedText: string
  reason: string
  issueType: 'typo' | 'incomplete' | 'missing_text' | 'incorrect'
  warning?: 'no_verse_record'
}

export async function scanChapterWithGemini(
  context: { translationName: string; bookName: string; chapter: number },
  verses: VerseScanInput[]
): Promise<VerseSuggestion[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const verseList = verses
    .map(v => `${v.verseId}\t${v.verseNum}\t${v.text || ''}`)
    .join('\n')

  const prompt = `You are reviewing a Bible translation for errors. Use your knowledge of the Bible to find issues.

Translation: ${context.translationName}
Book: ${context.bookName}
Chapter: ${context.chapter}

Flag ALL of the following:
- Spelling mistakes: wrong characters, corrupted syllables, garbled text that cannot be read meaningfully
- Missing words that break sentence structure or meaning
- Extra words that do not belong
- Incomplete verses: text that is clearly truncated mid-sentence
- Verses with EMPTY or BLANK text that should have content (based on your Bible knowledge)
- Content that does not match what this verse should say in any known Bible version
- Verse numbers that are ABSENT from the list below but should exist in this chapter — report these with verseId: null and originalText: ""

Do NOT flag:
- Punctuation style (፤ ። ፡ :: colons, periods, etc.)
- Archaic or formal word forms that are valid translations
- Acceptable spelling variations between manuscripts
- Formatting differences

Verses provided (tab-separated: verseId, verseNum, text — empty text means no translation stored):
${verseList}

Return ONLY a valid JSON array, no markdown fences, no explanation. Empty array [] if no issues found.
Each element must follow this schema exactly:
{"verseId": 123, "verseNum": 5, "chapter": ${context.chapter}, "originalText": "exact current text or empty string", "suggestedText": "corrected or complete text", "reason": "brief English explanation", "issueType": "typo|incomplete|missing_text|incorrect"}
For absent verse numbers use verseId: null.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim()
    .replace(/^```(?:json)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as VerseSuggestion[]
  } catch {
    return []
  }
}
