// Bible book groupings by literary section.
// Keyed by OSIS code (stable standard on BlBook.osisCode) — not by ID.
// Add Ethiopian Orthodox extended books at the end as needed.

export interface BibleSection {
  name: string
  osis: string[]
}

export const BIBLE_SECTIONS: BibleSection[] = [
  {
    name: 'Pentateuch',
    osis: ['Gen', 'Exod', 'Lev', 'Num', 'Deut'],
  },
  {
    name: 'Historical Books',
    osis: ['Josh', 'Judg', 'Ruth', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth'],
  },
  {
    name: 'Wisdom & Poetry',
    osis: ['Job', 'Ps', 'Prov', 'Eccl', 'Song'],
  },
  {
    name: 'Major Prophets',
    osis: ['Isa', 'Jer', 'Lam', 'Ezek', 'Dan'],
  },
  {
    name: 'Minor Prophets',
    osis: ['Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal'],
  },
  {
    name: 'Gospels',
    osis: ['Matt', 'Mark', 'Luke', 'John'],
  },
  {
    name: 'Acts',
    osis: ['Acts'],
  },
  {
    name: 'Pauline Epistles',
    osis: ['Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb'],
  },
  {
    name: 'General Epistles',
    osis: ['Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude'],
  },
  {
    name: 'Revelation',
    osis: ['Rev'],
  },
  // Ethiopian Orthodox Deuterocanonical books
  {
    name: 'Deuterocanonical',
    osis: ['Tob', 'Jdt', '1Macc', '2Macc', 'Wis', 'Sir', 'Bar', '1Esd', '2Esd', 'PrMan'],
  },
  {
    name: 'Ethiopian Canon',
    osis: ['1En', 'Jub', '4Ezra', '1Bar', 'RestEst', 'AddDan'],
  },
]

// Build a lookup map: osisCode → section name
export const OSIS_TO_SECTION: Record<string, string> = {}
for (const section of BIBLE_SECTIONS) {
  for (const osis of section.osis) {
    OSIS_TO_SECTION[osis] = section.name
  }
}
