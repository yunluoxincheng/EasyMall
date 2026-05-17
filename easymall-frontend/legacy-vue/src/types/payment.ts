export interface PaymentVO {
  id: number
  paymentNo: string
  orderId: number
  orderNo: string
  amount: number
  channel: string
  status: string
  statusText: string
  thirdTradeNo: string
  paidTime: string
  createTime: string
}
