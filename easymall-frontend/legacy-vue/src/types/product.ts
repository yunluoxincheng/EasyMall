export interface ProductPageItem {
  id: number
  name: string
  subtitle: string
  price: number
  stock: number
  sales: number
  image: string
  categoryId: number
  categoryName: string
  status: number
  createTime: string
}

export interface ProductDetail {
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
  updateTime: string
}

export interface ProductFormData {
  name: string
  subtitle: string
  description: string
  originalPrice: number | null
  price: number | null
  stock: number | null
  image: string
  images: string
  categoryId: number | null
  brand: string
}

export interface ProductQuery {
  pageNum: number
  pageSize: number
  name?: string
  categoryId?: number
  status?: number
}
