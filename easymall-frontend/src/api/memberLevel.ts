import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { MemberLevelItem, MemberLevelFormData } from '@/types/memberLevel'

export function getAllMemberLevels() {
  return request.get<Result<MemberLevelItem[]>>('/api/admin/member-levels')
}

export function createMemberLevel(data: MemberLevelFormData) {
  return request.post<Result<null>>('/api/admin/member-levels', data)
}

export function updateMemberLevel(id: number, data: MemberLevelFormData) {
  return request.put<Result<null>>(`/api/admin/member-levels/${id}`, data)
}

export function updateMemberLevelStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/member-levels/${id}/status`, null, { params: { status } })
}

export function deleteMemberLevel(id: number) {
  return request.delete<Result<null>>(`/api/admin/member-levels/${id}`)
}
