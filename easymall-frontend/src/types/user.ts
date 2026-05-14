export interface UserPageItem {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  avatar: string
  gender: number
  role: number
  status: number
  points: number
  level: number
  createTime: string
}

export interface UserDetail {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  avatar: string
  gender: number
  role: number
  status: number
  points: number
  level: number
  createTime: string
  updateTime: string
}

export interface UserQuery {
  pageNum: number
  pageSize: number
  username?: string
  phone?: string
  status?: number
  role?: number
}
