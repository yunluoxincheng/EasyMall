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

// 用户端评论类型
export interface UserCommentVO {
  id: number
  userId: number
  userNickname: string
  userAvatar: string
  productId: number
  orderId: number
  content: string
  rating: number
  images: string
  reply: string
  replyTime: string
  createTime: string
}

export interface CommentCreateDTO {
  productId: number
  orderId: number
  content: string
  rating: number
}
