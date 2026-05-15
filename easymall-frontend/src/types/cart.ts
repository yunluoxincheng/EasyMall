export interface CartVO {
  id: number
  productId: number
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  totalPrice: number
  selected: boolean
  stock: number
  createTime: string
}

export interface CartAddDTO {
  productId: number
  quantity: number
}

export interface CartUpdateDTO {
  quantity: number
}
