import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { UserCommentVO, CommentCreateDTO } from '@/types/comment'

export function createComment(data: CommentCreateDTO) {
  return request.post<Result<null>>('/api/comment/create', data)
}

export function getProductComments(productId: number, params: { pageNum?: number; pageSize?: number }) {
  return request.get<Result<PageResult<UserCommentVO>>>(`/api/comment/product/${productId}`, { params })
}

export function getMyComments(params: { pageNum?: number; pageSize?: number }) {
  return request.get<Result<PageResult<UserCommentVO>>>('/api/comment/user', { params })
}

export function deleteComment(commentId: number) {
  return request.delete<Result<null>>(`/api/comment/${commentId}`)
}
