import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { UserVO, LoginVO, UserRegisterDTO, UserUpdateDTO, PasswordUpdateDTO } from '@/types/user-user'

export function userLogin(data: { username: string; password: string }) {
  return request.post<Result<LoginVO>>('/api/user/login', data)
}

export function userRegister(data: UserRegisterDTO) {
  return request.post<Result<null>>('/api/user/register', data)
}

export function getUserInfo() {
  return request.get<Result<UserVO>>('/api/user/info')
}

export function updateUserInfo(data: UserUpdateDTO) {
  return request.put<Result<null>>('/api/user/info', data)
}

export function updatePassword(data: PasswordUpdateDTO) {
  return request.put<Result<null>>('/api/user/password', null, { params: data })
}

export function userLogout() {
  return request.post<Result<null>>('/api/user/logout')
}
