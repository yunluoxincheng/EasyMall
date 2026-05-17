import request from '@/utils/request'
import type { Result, MyBatisPage } from '@/types/api'
import type { PointsProductVO, PointsExchangeVO } from '@/types/points'

export function getPointsProducts() {
  return request.get<Result<PointsProductVO[]>>('/api/points/exchange/products')
}

export function exchangeProduct(data: {
  productId: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark?: string
}) {
  return request.post<Result<string>>('/api/points/exchange/exchange', data)
}

export function getExchangeRecords(params: { pageNum?: number; pageSize?: number }) {
  return request.get<Result<MyBatisPage<PointsExchangeVO>>>('/api/points/exchange/records', { params })
}
