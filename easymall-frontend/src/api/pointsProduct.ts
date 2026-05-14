import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { PointsProductPageItem, PointsProductFormData, PointsProductQuery } from '@/types/pointsProduct'

export function getPointsProductPage(params: PointsProductQuery) {
  return request.get<Result<PageResult<PointsProductPageItem>>>('/api/admin/points-products', { params })
}

export function createPointsProduct(data: PointsProductFormData) {
  return request.post<Result<null>>('/api/admin/points-products', data)
}

export function updatePointsProduct(id: number, data: PointsProductFormData) {
  return request.put<Result<null>>(`/api/admin/points-products/${id}`, data)
}

export function updatePointsProductStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/points-products/${id}/status`, null, { params: { status } })
}

export function deletePointsProduct(id: number) {
  return request.delete<Result<null>>(`/api/admin/points-products/${id}`)
}
