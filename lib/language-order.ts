// Canonical display order for Ethiopian Bible/church languages.
// Anything not listed falls back to the end, sorted alphabetically.
// Aliases are normalised so spelling variants still match (e.g. Geez/Ge'ez,
// Tigrigna/Tigrinya, Afaan Oromo/Oromifa).
const ORDER: string[] = ["english", "amharic", "geez", "tigrigna", "oromo"]

const ALIASES: Record<string, string> = {
  "english": "english",
  "amharic": "amharic",
  "geez": "geez",
  "ge'ez": "geez",
  "giiz": "geez",
  "gees": "geez",
  "tigrigna": "tigrigna",
  "tigrinya": "tigrigna",
  "tigrina": "tigrigna",
  "afaan oromo": "oromo",
  "afan oromo": "oromo",
  "oromo": "oromo",
  "oromifa": "oromo",
  "oromiffa": "oromo",
  "oromigna": "oromo",
}

function rank(name: string): number {
  const key = ALIASES[name.trim().toLowerCase()] ?? name.trim().toLowerCase()
  const idx = ORDER.indexOf(key)
  return idx === -1 ? ORDER.length : idx
}

export function sortLanguages<T extends { name: string }>(languages: T[]): T[] {
  return [...languages].sort((a, b) => {
    const ra = rank(a.name)
    const rb = rank(b.name)
    if (ra !== rb) return ra - rb
    return a.name.localeCompare(b.name)
  })
}
