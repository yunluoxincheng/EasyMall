import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ProductPageItem, ProductDetail, ProductFormData, ProductQuery } from '@/types/product'

export function getProductPage(params: ProductQuery) {
  return request.get<Result<PageResult<ProductPageItem>>>('/api/admin/products', { params })
}

export function getProductById(id: number) {
  return request.get<Result<ProductDetail>>(`/api/admin/products/${id}`)
}

export function createProduct(data: ProductFormData) {
  return request.post<Result<null>>('/api/admin/products', data)
}

export function updateProduct(id: number, data: ProductFormData) {
  return request.put<Result<null>>(`/api/admin/products/${id}`, data)
}

export function updateProductStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/products/${id}/status`, null, { params: { status } })
}

export function updateProductStock(id: number, stock: number) {
  return request.put<Result<null>>(`/api/admin/products/${id}/stock`, null, { params: { stock } })
}

export function deleteProduct(id: number) {
  return request.delete<Result<null>>(`/api/admin/products/${id}`)
}
