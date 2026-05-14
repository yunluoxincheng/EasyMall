export interface PointsProductPageItem {
  id: number
  name: string
  description: string
  image: string
  pointsRequired: number
  stock: number
  exchangeCount: number
  status: number
  sortOrder: number
  createTime: string
}

export interface PointsProductFormData {
  name: string
  description: string
  image: string
  pointsRequired: number | null
  stock: number | null
  sortOrder: number
}

export interface PointsProductQuery {
  pageNum: number
  pageSize: number
  name?: string
  status?: number
}
