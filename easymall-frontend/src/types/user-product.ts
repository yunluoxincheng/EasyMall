export interface ProductVO {
  id: number
  name: string
  subtitle: string
  description: string
  originalPrice: number
  price: number
  stock: number
  sales: number
  image: string
  images: string[]
  categoryId: number
  categoryName: string
  brand: string
  status: number
  createTime: string
}

export interface ProductQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  categoryId?: number
}

export interface CategoryVO {
  id: number
  name: string
  icon: string
  parentId: number
  level: number
  sort: number
  status: number
  createTime: string
  children?: CategoryVO[]
}
