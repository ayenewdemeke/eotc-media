export interface QzQuestion {
  id: number
  userId: number
  approvalStatusId: number
  typeId: number
  difficultyId: number | null
  questionText: string
  createdAt: Date
  updatedAt: Date
  approvalStatus?: QzApprovalStatus
  type?: QzQuestionType
  difficulty?: QzDifficulty | null
  choices?: QzChoice[]
  languages?: QzLanguage[]
  categories?: QzCategory[]
  subCategories?: QzSubCategory[]
  user?: { id: number; name: string | null }
}

export interface QzChoice {
  id: number
  questionId: number
  choiceText: string
  isCorrect: boolean
}

export interface QzCategory {
  id: number
  name: string
  subCategories?: QzSubCategory[]
}

export interface QzSubCategory {
  id: number
  categoryId: number
  name: string
}

export interface QzLanguage {
  id: number
  name: string
}

export interface QzDifficulty {
  id: number
  name: string
}

export interface QzQuestionType {
  id: number
  name: string
}

export interface QzApprovalStatus {
  id: number
  name: string
}

export interface QzRoom {
  id: number
  hostUserId: number
  name: string | null
  roomCode: string
  status: string
  totalRoundsPlayed: number
  createdAt: Date
  updatedAt: Date
  members?: QzRoomMember[]
  rounds?: QzRound[]
  host?: { id: number; name: string | null }
}

export interface QzRoomMember {
  id: number
  roomId: number
  userId: number
  createdAt: Date
  user?: { id: number; name: string | null }
  rounds?: QzRoomMemberRound[]
}

export interface QzRoomMemberRound {
  id: number
  roomMemberId: number
  roundId: number
  isReady: boolean
}

export interface QzRound {
  id: number
  roomId: number
  roundNumber: number
  timerSeconds: number
  status: string
  startedAt: Date | null
  endedAt: Date | null
  createdAt: Date
  updatedAt: Date
  questions?: QzRoundQuestion[]
  memberRounds?: QzRoomMemberRound[]
  results?: QzRoundResult[]
}

export interface QzRoundQuestion {
  id: number
  roundId: number
  questionId: number
  question?: QzQuestion
  answers?: QzRoundAnswer[]
}

export interface QzRoundAnswer {
  id: number
  roundQuestionId: number
  userId: number
  choiceId: number
  createdAt: Date
  choice?: QzChoice
}

export interface QzRoundResult {
  id: number
  roundId: number
  userId: number
  score: number
  rank: number
  user?: { id: number; name: string | null }
}
