export interface CategoryPageItem {
  id: number
  name: string
  icon: string
  parentId: number
  parentName: string
  level: number
  sort: number
  status: number
}

export interface CategoryDetail {
  id: number
  name: string
  icon: string
  parentId: number
  parentName: string
  level: number
  sort: number
  status: number
  createTime: string
  updateTime: string
}

export interface CategoryFormData {
  name: string
  icon: string
  parentId: number | null
  level: number
  sort: number
  status: number
}

export interface CategoryQuery {
  pageNum: number
  pageSize: number
  name?: string
  parentId?: number
  level?: number
  status?: number
}
