export interface PointsRecordVO {
  id: number
  pointsChange: number
  beforePoints: number
  afterPoints: number
  type: number
  typeDesc: string
  bizType: string
  bizId: string
  sourceId: number
  description: string
  createTime: string
}

export interface PointsProductVO {
  id: number
  name: string
  description: string
  image: string
  pointsRequired: number
  stock: number
  exchangeCount: number
  status: number
  canExchange: boolean
  createTime: string
}

export interface PointsExchangeVO {
  id: number
  exchangeNo: string
  productId: number
  productName: string
  pointsUsed: number
  status: number
  statusText: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark: string
  createTime: string
}

export interface PointsExchangeDTO {
  productId: number
}

export interface PointsRecordQuery {
  pageNum?: number
  pageSize?: number
}

export interface PointsProductQuery {
  pageNum?: number
  pageSize?: number
}

export interface PointsExchangeQuery {
  pageNum?: number
  pageSize?: number
}
