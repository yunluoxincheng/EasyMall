import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { OrderPageItem, OrderDetail, OrderQuery } from '@/types/order'

export function getOrderPage(params: OrderQuery) {
  return request.get<Result<PageResult<OrderPageItem>>>('/api/admin/orders', { params })
}

export function getOrderById(id: number) {
  return request.get<Result<OrderDetail>>(`/api/admin/orders/${id}`)
}

export function updateOrderStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/orders/${id}/status`, null, { params: { status } })
}

export function cancelOrder(id: number) {
  return request.put<Result<null>>(`/api/admin/orders/${id}/cancel`)
}
