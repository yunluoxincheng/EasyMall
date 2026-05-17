import request from '@/utils/request'
import type { Result } from '@/types/api'

export interface LoginVO {
  token: string
  userId: number
  username: string
  nickname: string
  avatar: string
  role: number
}

export function login(data: { username: string; password: string }) {
  return request.post<Result<LoginVO>>('/api/user/login', data)
}
