import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { UserPageItem, UserDetail, UserQuery } from '@/types/user'

export function getUserPage(params: UserQuery) {
  return request.get<Result<PageResult<UserPageItem>>>('/api/admin/users', { params })
}

export function getUserById(id: number) {
  return request.get<Result<UserDetail>>(`/api/admin/users/${id}`)
}

export function updateUserStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/users/${id}/status`, null, { params: { status } })
}

export function updateUserRole(id: number, role: number) {
  return request.put<Result<null>>(`/api/admin/users/${id}/role`, null, { params: { role } })
}

export function updateUserPoints(id: number, points: number) {
  return request.put<Result<null>>(`/api/admin/users/${id}/points`, null, { params: { points } })
}
