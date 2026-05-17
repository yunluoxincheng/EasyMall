import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { SignInResultVO } from '@/types/member'

export function doSignIn() {
  return request.post<Result<SignInResultVO>>('/api/signin/do')
}

export function getSignInStatus() {
  return request.get<Result<SignInResultVO>>('/api/signin/status')
}

export function getContinuousDays() {
  return request.get<Result<{ continuousDays: number }>>('/api/signin/continuous')
}
