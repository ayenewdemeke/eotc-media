export const SITE_URL = "https://eotcmedia.com"
export const SITE_NAME = "EOTC Media"

// English + Amharic keywords covering the discovery topics:
// amharic/oromifa bible, voice bible search, EOTC mezmur, bible quiz, spiritual books
export const SITE_KEYWORDS = [
  // English
  "Amharic Bible",
  "Amharic Bible online",
  "Oromifa Bible",
  "Afaan Oromo Bible",
  "Tigrigna Bible",
  "Ethiopian Bible",
  "Bible voice search",
  "voice based Bible search",
  "Ethiopian Orthodox Tewahedo Church",
  "EOTC",
  "EOTC mezmur",
  "Ethiopian Orthodox mezmur",
  "Orthodox hymns",
  "Amharic mezmur",
  "Amharic spiritual songs",
  "Amharic Bible quiz",
  "Ethiopian Orthodox quiz",
  "Amharic spiritual books",
  "Ethiopian Orthodox books",
  "Ethiopian Orthodox sermons",
  "Amharic sermons",
  "Ethiopian Orthodox liturgy",
  "Kidase",
  // Amharic
  "መጽሐፍ ቅዱስ",
  "የአማርኛ መጽሐፍ ቅዱስ",
  "መጽሐፍ ቅዱስ በአማርኛ",
  "መጽሐፍ ቅዱስ በድምጽ ፍለጋ",
  "የኦሮምኛ መጽሐፍ ቅዱስ",
  "የትግርኛ መጽሐፍ ቅዱስ",
  "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን",
  "ኦርቶዶክስ ተዋሕዶ",
  "መዝሙር",
  "መዝሙሮች",
  "ኦርቶዶክስ መዝሙር",
  "የኦርቶዶክስ ተዋሕዶ መዝሙሮች",
  "መንፈሳዊ መዝሙራት",
  "የመጽሐፍ ቅዱስ ጥያቄዎች",
  "የመጽሐፍ ቅዱስ ጥያቄና መልስ",
  "መንፈሳዊ መጻሕፍት",
  "የቤተ ክርስቲያን መጻሕፍት",
  "ስብከት",
  "ስብከቶች",
  "ቅዳሴ",
  // Oromifa
  "Kitaaba Qulqulluu",
  "Macaafa Qulqulluu",
  "Faarfannaa",
]

export const SITE_DESCRIPTION =
  "Read the Holy Bible in Amharic, English, Afaan Oromo and Tigrigna with voice search, " +
  "listen to Ethiopian Orthodox Tewahedo Church (EOTC) mezmurs and sermons, study spiritual books, " +
  "follow the liturgy (Kidase), and test yourself with Bible quizzes. " +
  "መጽሐፍ ቅዱስ በአማርኛ፣ በኦሮምኛ እና በትግርኛ፣ የኦርቶዶክስ ተዋሕዶ መዝሙሮች፣ ስብከቶች፣ መንፈሳዊ መጻሕፍት፣ ቅዳሴ እና የመጽሐፍ ቅዱስ ጥያቄዎች።"

/**
 * Serialize a schema.org object for a JSON-LD <script> tag.
 * Escapes "<" to prevent script injection through user-supplied strings.
 */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
