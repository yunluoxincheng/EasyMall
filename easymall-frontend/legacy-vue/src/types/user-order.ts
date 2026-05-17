export interface OrderVO {
  id: number
  orderNo: string
  userId: number
  totalAmount: number
  payAmount: number
  status: number
  statusText: string
  paymentMethod: string
  payTime: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark: string
  createTime: string
  orderItems: OrderItemVO[]
}

export interface OrderItemVO {
  id: number
  orderId: number
  productId: number
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  totalPrice: number
  createTime: string
}

export interface OrderCreateDTO {
  cartIds: number[]
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark?: string
  userCouponId?: number
}

export interface OrderCreateVO {
  orderNo: string
  paymentNo: string
}

export interface OrderQuery {
  pageNum?: number
  pageSize?: number
  status?: number
}
