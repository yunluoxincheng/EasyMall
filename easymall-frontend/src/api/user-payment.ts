import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { PaymentVO } from '@/types/payment'

export function payByPaymentNo(paymentNo: string) {
  return request.post<Result<PaymentVO>>(`/api/payment/${paymentNo}/pay`)
}

export function getPaymentByPaymentNo(paymentNo: string) {
  return request.get<Result<PaymentVO>>(`/api/payment/${paymentNo}`)
}

export function getPaymentByOrderId(orderId: number) {
  return request.get<Result<PaymentVO>>(`/api/payment/order/${orderId}`)
}
