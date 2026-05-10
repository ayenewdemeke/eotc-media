// Bible book groupings by literary section.
// Keyed by OSIS code (stable standard on BlBook.osisCode) — not by ID.
// Add Ethiopian Orthodox extended books at the end as needed.

export interface BibleSection {
  name: string
  nameAmharic: string
  osis: string[]
}

export const BIBLE_SECTIONS: BibleSection[] = [
  {
    name: 'Pentateuch',
    nameAmharic: 'የሙሴ አምስት መጻሕፍት',
    osis: ['Gen', 'Exod', 'Lev', 'Num', 'Deut'],
  },
  {
    name: 'Historical Books',
    nameAmharic: 'የታሪክ መጻሕፍት',
    osis: ['Josh', 'Judg', 'Ruth', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth'],
  },
  {
    name: 'Wisdom & Poetry',
    nameAmharic: 'ጥበብና ግጥም',
    osis: ['Job', 'Ps', 'Prov', 'Eccl', 'Song'],
  },
  {
    name: 'Major Prophets',
    nameAmharic: 'ዋና ነቢያት',
    osis: ['Isa', 'Jer', 'Lam', 'Ezek', 'Dan'],
  },
  {
    name: 'Minor Prophets',
    nameAmharic: 'ደቂቅ ነቢያት',
    osis: ['Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal'],
  },
  {
    name: 'Gospels',
    nameAmharic: 'ወንጌላት',
    osis: ['Matt', 'Mark', 'Luke', 'John'],
  },
  {
    name: 'Acts',
    nameAmharic: 'የሐዋርያት ሥራ',
    osis: ['Acts'],
  },
  {
    name: 'Pauline Epistles',
    nameAmharic: 'የጳውሎስ መልእክቶች',
    osis: ['Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb'],
  },
  {
    name: 'General Epistles',
    nameAmharic: 'ሌሎች መልእክቶች',
    osis: ['Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude'],
  },
  {
    name: 'Revelation',
    nameAmharic: 'ራእይ',
    osis: ['Rev'],
  },
  // Ethiopian Orthodox Deuterocanonical books
  {
    name: 'Deuterocanonical',
    nameAmharic: 'ዲዩትሮካኖኒካል',
    osis: ['Tob', 'Jdt', '1Macc', '2Macc', 'Wis', 'Sir', 'Bar', '1Esd', '2Esd', 'PrMan'],
  },
  {
    name: 'Ethiopian Canon',
    nameAmharic: 'የኢትዮጵያ ቀኖና',
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
