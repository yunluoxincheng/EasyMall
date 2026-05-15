import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { CartVO } from '@/types/cart'

export function getCartList() {
  return request.get<Result<CartVO[]>>('/api/cart/list')
}

export function getCartCount() {
  return request.get<Result<number>>('/api/cart/count')
}

export function addToCart(data: { productId: number; quantity: number }) {
  return request.post<Result<null>>('/api/cart/add', data)
}

export function updateCartItem(cartId: number, data: { quantity: number }) {
  return request.put<Result<null>>(`/api/cart/${cartId}`, data)
}

export function deleteCartItem(cartId: number) {
  return request.delete<Result<null>>(`/api/cart/${cartId}`)
}

export function batchDeleteCartItems(cartIds: number[]) {
  return request.delete<Result<null>>('/api/cart/batch', { data: cartIds })
}

export function selectAllCart(selected: boolean) {
  return request.put<Result<null>>(`/api/cart/selectAll/${selected}`)
}

export function batchSelectCart(selected: boolean, cartIds: number[]) {
  return request.put<Result<null>>(`/api/cart/batchSelect/${selected}`, cartIds)
}
