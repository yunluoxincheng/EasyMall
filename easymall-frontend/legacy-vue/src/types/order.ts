export const OrderStatus = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  SHIPPED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  WAITING_SHIPMENT: 5,
  REFUNDING: 6,
  REFUNDED: 7,
} as const

export const orderStatusMap: Record<number, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待支付',
  [OrderStatus.PAID]: '已支付',
  [OrderStatus.SHIPPED]: '已发货',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.WAITING_SHIPMENT]: '待发货',
  [OrderStatus.REFUNDING]: '退款中',
  [OrderStatus.REFUNDED]: '已退款',
}

export interface OrderPageItem {
  id: number
  orderNo: string
  userId: number
  username: string
  nickname: string
  totalAmount: number
  payAmount: number
  status: number
  paymentMethod: string
  createTime: string
}

export interface OrderItemVO {
  id: number
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
  subtotal: number
}

export interface OrderDetail {
  id: number
  orderNo: string
  userId: number
  username: string
  nickname: string
  phone: string
  totalAmount: number
  payAmount: number
  status: number
  paymentMethod: string
  payTime: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark: string
  createTime: string
  updateTime: string
  items: OrderItemVO[]
}

export interface OrderQuery {
  pageNum: number
  pageSize: number
  orderNo?: string
  status?: number
}
