export interface HmHymn {
  id: number
  slug: string
  videoId: string
  title: string
  singer: string | null
  lyrics: string | null
  description: string | null
  thumbnailDefault: string
  thumbnailMedium: string
  thumbnailHigh: string
  thumbnailStandard: string | null
  thumbnailMaxres: string | null
  clicksCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  categories?: HmCategory[]
  subCategories?: HmSubCategory[]
  languages?: HmLanguage[]
  singers?: HmSinger[]
  channel?: HmChannel
  isFavorited?: boolean
  approvalStatus?: HmApprovalStatus
}

export interface HmCategory { id: number; name: string; languageId?: number | null; slug?: string | null }
export interface HmSubCategory { id: number; name: string; categoryId: number; slug?: string | null }
export interface HmLanguage { id: number; name: string; slug?: string | null }
export interface HmSinger { id: number; name: string }
export interface HmChannel {
  id: number
  title: string
  slug: string
  ytChannelId?: string | null
  handle: string
  description?: string | null
  thumbnailDefault?: string | null
  thumbnailMedium?: string | null
  thumbnailHigh?: string | null
  coverImage?: string | null
  country?: string | null
  publishedAt?: Date | null
}
export interface HmComment {
  id: number
  userId: number
  hymnId: number
  comment: string
  createdAt: Date
  user?: { id: number; name: string | null; image: string | null }
}
export interface HmApprovalStatus { id: number; name: string }
