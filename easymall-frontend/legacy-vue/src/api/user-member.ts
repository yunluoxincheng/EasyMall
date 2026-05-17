import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { MemberLevelVO } from '@/types/member'

export function getMemberLevels() {
  return request.get<Result<MemberLevelVO[]>>('/api/member/levels')
}

export function getCurrentLevel() {
  return request.get<Result<MemberLevelVO>>('/api/member/level')
}

export function getMemberDiscount() {
  return request.get<Result<{ discount: number }>>('/api/member/discount')
}
