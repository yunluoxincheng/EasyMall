import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { CategoryPageItem, CategoryDetail, CategoryFormData, CategoryQuery } from '@/types/category'

export function getCategoryPage(params: CategoryQuery) {
  return request.get<Result<PageResult<CategoryPageItem>>>('/api/admin/categories', { params })
}

export function getCategoryById(id: number) {
  return request.get<Result<CategoryDetail>>(`/api/admin/categories/${id}`)
}

export function createCategory(data: CategoryFormData) {
  return request.post<Result<null>>('/api/admin/categories', data)
}

export function updateCategory(id: number, data: CategoryFormData) {
  return request.put<Result<null>>(`/api/admin/categories/${id}`, data)
}

export function updateCategoryStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/categories/${id}/status`, null, { params: { status } })
}

export function deleteCategory(id: number) {
  return request.delete<Result<null>>(`/api/admin/categories/${id}`)
}
