export interface CbLanguage {
  id: number
  name: string
}

export interface CbCategory {
  id: number
  name: string
}

export interface CbSubCategory {
  id: number
  name: string
  categoryId: number
}

export interface CbAuthor {
  id: number
  name: string
}

export interface CbApprovalStatus {
  id: number
  name: string
}

export interface CbBookComment {
  id: number
  bookId: number
  userId: number
  comment: string
  createdAt: string
  user?: { id: number; name: string }
}

export interface CbBook {
  id: number
  slug: string
  name: string
  author: string
  description?: string | null
  image?: string | null
  file: string
  userId: number
  approvalStatusId: number
  createdAt: string
  updatedAt: string
  approvalStatus?: CbApprovalStatus
  languages?: CbLanguage[]
  categories?: CbCategory[]
  subCategories?: CbSubCategory[]
  authors?: CbAuthor[]
  likesCount?: number
  hasLiked?: boolean
  commentsCount?: number
}
