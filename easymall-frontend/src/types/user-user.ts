export interface UserVO {
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

export interface LoginVO {
  token: string
  userId: number
  username: string
  nickname: string
  avatar: string
  role: number
}

export interface UserRegisterDTO {
  username: string
  nickname: string
  password: string
  confirmPassword: string
  phone?: string
  email?: string
}

export interface UserUpdateDTO {
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  gender?: number
}

export interface PasswordUpdateDTO {
  oldPassword: string
  newPassword: string
}
