export interface MemberLevelItem {
  id: number
  level: number
  levelName: string
  minPoints: number
  maxPoints: number
  discount: number
  icon: string
  benefits: string
  sortOrder: number
  status: number
  createTime: string
  updateTime: string
}

export interface MemberLevelFormData {
  level: number | null
  levelName: string
  minPoints: number | null
  maxPoints: number | null
  discount: number | null
  icon: string
  benefits: string
  sortOrder: number
}
