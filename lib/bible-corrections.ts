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
  issueType: 'typo' | 'incomplete' | 'missing_text'
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

  const prompt = `You are a database integrity checker for a Bible database. Your ONLY task is to detect corrupted or missing data — not to review translation quality or suggest improvements.

Translation: ${context.translationName}
Book: ${context.bookName}
Chapter: ${context.chapter}

Report ONLY these three specific data problems:

1. CORRUPTED TEXT (issueType: "typo") — Characters or syllables that are clearly broken or unreadable: random symbol sequences, obviously garbled script, characters that produce no recognizable word in the language. Do NOT flag a verse just because you would choose different words.

2. TRUNCATED TEXT (issueType: "incomplete") — A verse whose text cuts off mid-sentence with no ending, leaving an obviously incomplete thought. A short verse is not truncated — only flag if it clearly stops before finishing.

3. EMPTY OR ABSENT DATA (issueType: "missing_text") — A verse field that is completely empty, OR a verse number that should exist in this chapter but is entirely missing from the list below (report missing verse numbers with verseId: null and originalText: "").

NEVER flag any of the following — ignore them completely:
- Word choice, phrasing, or alternative valid translations
- Grammar or sentence structure
- Style, register, or archaic language
- Punctuation, spacing, or formatting
- Theological or interpretive differences between Bible versions
- Any text that forms a complete, readable sentence — even if you disagree with the translation

If you are uncertain whether something is corrupted data vs. a valid translation choice, do NOT flag it.

Verses (tab-separated: verseId, verseNum, text — empty text means no translation stored):
${verseList}

Return ONLY a valid JSON array, no markdown fences, no explanation. Empty array [] if no issues found.
Schema: {"verseId": 123, "verseNum": 5, "chapter": ${context.chapter}, "originalText": "exact current text or empty string", "suggestedText": "corrected or restored text", "reason": "one sentence describing the data problem", "issueType": "typo|incomplete|missing_text"}
For missing verse numbers use verseId: null.`

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
