export interface SmCategory {
  id: number
  name: string
}

export interface SmSubCategory {
  id: number
  categoryId: number
  name: string
}

export interface SmLanguage {
  id: number
  name: string
}

export interface SmPreacher {
  id: number
  name: string
}

export interface SmChannel {
  id: number
  name: string
  slug?: string | null
  handle: string
  description?: string | null
  thumbnailDefault?: string | null
  thumbnailMedium?: string | null
  thumbnailHigh?: string | null
  coverImage?: string | null
  publishedAt?: Date | null
}

export interface SmApprovalStatus {
  id: number
  name: string
}

export interface SmSermon {
  id: number
  slug: string
  videoId: string
  title: string
  preacher?: string | null
  description?: string | null
  thumbnailDefault: string
  thumbnailMedium: string
  thumbnailHigh: string
  thumbnailStandard?: string | null
  thumbnailMaxres?: string | null
  clicksCount: number
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  categories?: SmCategory[]
  subCategories?: SmSubCategory[]
  languages?: SmLanguage[]
  preachers?: SmPreacher[]
  channel?: SmChannel
  approvalStatus?: SmApprovalStatus
  isFavorited?: boolean
}
