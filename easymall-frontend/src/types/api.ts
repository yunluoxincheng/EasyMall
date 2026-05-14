export interface Result<T> {
  success: boolean
  code: string
  message: string
  timestamp: string
  traceId: string
  data: T
  errors?: ErrorDetail[]
}

export interface ErrorDetail {
  field: string
  code: string
  message: string
  rejectedValue: unknown
}

export interface PageResult<T> {
  total: number
  records: T[]
  pageNum: number
  pageSize: number
  pages: number
}

export interface MyBatisPage<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}
