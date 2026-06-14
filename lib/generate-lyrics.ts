import { YoutubeTranscript } from 'youtube-transcript'
import { GoogleGenerativeAI } from '@google/generative-ai'

const LANG_PRIORITY = ['am', 'ti', 'om', 'en']

export async function fetchTranscript(videoId: string): Promise<string | null> {
  for (const lang of LANG_PRIORITY) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang })
      if (segments.length > 0) {
        return segments.map(s => s.text).join(' ')
      }
    } catch {
      // try next language
    }
  }
  // fallback: try without language preference
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId)
    if (segments.length > 0) {
      return segments.map(s => s.text).join(' ')
    }
  } catch {
    // no transcript available
  }
  return null
}

export async function formatLyricsWithGemini(rawText: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are given raw subtitle text extracted from a religious hymn video. Format it as clean, properly structured lyrics HTML.

Rules:

Contextual Correction: Use your knowledge of the hymn and the language (Amharic or English) to correct subtitle artifacts, misspellings, or nonsensical phrases while maintaining the original meaning.

Structure: Use <p> tags for each verse or stanza and <br> for line breaks within a verse.

Cleanup: Remove timestamps, duplicate lines, and technical artifacts.

Preservation: Keep the original language; do not translate.

Output: Do not add any explanation or preamble. Output only the HTML.

Raw subtitle text:
${rawText}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  // Strip markdown code-block wrappers if present (e.g. ```html ... ```)
  return text.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '').trim()
}
