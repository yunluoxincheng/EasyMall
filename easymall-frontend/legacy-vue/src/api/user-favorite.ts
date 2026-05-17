import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { FavoriteVO } from '@/types/favorite'

export function addFavorite(productId: number) {
  return request.post<Result<null>>(`/api/favorite/add/${productId}`)
}

export function removeFavorite(productId: number) {
  return request.delete<Result<null>>(`/api/favorite/remove/${productId}`)
}

export function toggleFavorite(productId: number) {
  return request.post<Result<boolean>>(`/api/favorite/toggle/${productId}`)
}

export function checkFavorite(productId: number) {
  return request.get<Result<boolean>>(`/api/favorite/check/${productId}`)
}

export function getFavoritePage(params: { pageNum?: number; pageSize?: number }) {
  return request.get<Result<PageResult<FavoriteVO>>>('/api/favorite/page', { params })
}
