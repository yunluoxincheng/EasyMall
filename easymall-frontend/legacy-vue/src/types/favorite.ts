export interface FavoriteVO {
  id: number
  productId: number
  productName: string
  productImage: string
  productPrice: number
  productStock: number
  createTime: string
  isFavorite: boolean
}

export interface FavoriteQuery {
  pageNum?: number
  pageSize?: number
}
