import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { CommentPageItem, CommentQuery } from '@/types/comment'

export function getCommentPage(params: CommentQuery) {
  return request.get<Result<PageResult<CommentPageItem>>>('/api/admin/comments', { params })
}

export function approveComment(id: number) {
  return request.put<Result<null>>(`/api/admin/comments/${id}/approve`)
}

export function rejectComment(id: number) {
  return request.put<Result<null>>(`/api/admin/comments/${id}/reject`)
}

export function replyComment(id: number, reply: string) {
  return request.put<Result<null>>(`/api/admin/comments/${id}/reply`, { reply })
}

export function deleteComment(id: number) {
  return request.delete<Result<null>>(`/api/admin/comments/${id}`)
}
