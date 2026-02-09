// Liturgy Types

export interface LtSection {
  id: number
  nameGeez: string
  nameAmharic: string
  nameEnglish: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export interface LtRole {
  id: number
  roleKey: string
  nameAmharic: string
  nameEnglish: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

export interface LtLiturgicalText {
  id: number
  sectionId: number
  orderIndex: number
  roleId: number
  textGeez: string
  textAmharic: string
  textEnglishTransliteration: string
  textEnglishTranslation: string
  remark: string | null
  audioGeezFilePath: string | null
  audioEzilFilePath: string | null
  audioArarayFilePath: string | null
  createdAt: Date
  updatedAt: Date
  section?: LtSection
  role?: LtRole
}

export type LiturgyLanguage = 'geez' | 'amharic' | 'english' | 'english-transliteration'

export interface LiturgyData {
  sections: LtSection[]
  roles: LtRole[]
  liturgicalTexts: LtLiturgicalText[]
  language: LiturgyLanguage
}
