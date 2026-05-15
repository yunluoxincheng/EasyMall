export interface MemberLevelVO {
  level: number
  levelName: string
  minPoints: number
  maxPoints: number
  discount: number
  icon: string
  benefits: string
  currentPoints: number
  pointsToNextLevel: number
  isCurrentLevel: boolean
}

export interface SignInResultVO {
  success: boolean
  message: string
  pointsEarned: number
  continuousDays: number
  currentPoints: number
  hasSignedToday: boolean
}
