import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ProductVO, ProductQuery } from '@/types/user-product'

export function getProductPage(params: ProductQuery) {
  return request.get<Result<PageResult<ProductVO>>>('/api/product/page', { params })
}

export function getProductById(id: number) {
  return request.get<Result<ProductVO>>(`/api/product/${id}`)
}

export function getHotProducts(limit: number = 8) {
  return request.get<Result<ProductVO[]>>('/api/product/hot', { params: { limit } })
}

export function getNewProducts(limit: number = 8) {
  return request.get<Result<ProductVO[]>>('/api/product/new', { params: { limit } })
}

export function getRelatedProducts(categoryId: number, productId: number, limit: number = 5) {
  return request.get<Result<ProductVO[]>>('/api/product/related', { params: { categoryId, productId, limit } })
}
