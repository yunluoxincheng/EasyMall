import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { OrderVO, OrderCreateDTO, OrderCreateVO, OrderQuery } from '@/types/user-order'
import type { PaymentVO } from '@/types/payment'

export function createOrder(data: OrderCreateDTO) {
  return request.post<Result<OrderCreateVO>>('/api/order/create', data)
}

export function getOrderPage(params: OrderQuery) {
  return request.get<Result<PageResult<OrderVO>>>('/api/order/page', { params })
}

export function getOrderById(orderId: number) {
  return request.get<Result<OrderVO>>(`/api/order/${orderId}`)
}

export function getOrderPayment(orderId: number) {
  return request.get<Result<PaymentVO>>(`/api/order/${orderId}/payment`)
}

export function cancelOrder(orderId: number) {
  return request.put<Result<null>>(`/api/order/${orderId}/cancel`)
}

export function confirmOrder(orderId: number) {
  return request.put<Result<null>>(`/api/order/${orderId}/confirm`)
}
