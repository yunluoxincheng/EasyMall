export interface CommentPageItem {
  id: number
  userId: number
  username: string
  nickname: string
  productId: number
  productName: string
  content: string
  rating: number
  showStatus: number
  reply: string
  createTime: string
}

export interface CommentQuery {
  pageNum: number
  pageSize: number
  productId?: number
  userId?: number
  showStatus?: number
  rating?: number
}
