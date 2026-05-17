import request from '@/utils/request'
import type { Result, MyBatisPage } from '@/types/api'
import type { CouponTemplateVO, CouponTemplateDTO, CouponQuery, CouponUsageLogVO, UsageLogQuery, CouponStatistics } from '@/types/coupon'

export function getCouponPage(params: CouponQuery) {
  return request.get<Result<MyBatisPage<CouponTemplateVO>>>('/api/admin/coupon/templates', { params })
}

export function getCouponById(id: number) {
  return request.get<Result<CouponTemplateVO>>(`/api/admin/coupon/template/${id}`)
}

export function createCoupon(data: CouponTemplateDTO) {
  return request.post<Result<number>>('/api/admin/coupon/template', data)
}

export function updateCoupon(data: CouponTemplateDTO) {
  return request.put<Result<null>>('/api/admin/coupon/template', data)
}

export function updateCouponStatus(id: number, status: number) {
  return request.put<Result<null>>(`/api/admin/coupon/template/${id}/status`, null, { params: { status } })
}

export function deleteCoupon(id: number) {
  return request.delete<Result<null>>(`/api/admin/coupon/template/${id}`)
}

export function getUsageLogs(params: UsageLogQuery) {
  return request.get<Result<MyBatisPage<CouponUsageLogVO>>>('/api/admin/coupon/usage-logs', { params })
}

export function getCouponStatistics(templateId?: number) {
  return request.get<Result<CouponStatistics>>('/api/admin/coupon/statistics', { params: { templateId } })
}
