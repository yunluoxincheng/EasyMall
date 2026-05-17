import request from '@/utils/request'
import type { Result, MyBatisPage } from '@/types/api'
import type { CouponTemplateVO, UserCouponVO, CouponCalculateResultVO } from '@/types/coupon'

export function getCouponTemplates() {
  return request.get<Result<CouponTemplateVO[]>>('/api/coupon/templates')
}

export function receiveCoupon(templateId: number) {
  return request.post<Result<number>>(`/api/coupon/receive/${templateId}`)
}

export function getMyCoupons(params: { status?: number; pageNum?: number; pageSize?: number }) {
  return request.get<Result<MyBatisPage<UserCouponVO>>>('/api/coupon/my', { params })
}

export function getAvailableCoupons(orderAmount: number) {
  return request.get<Result<UserCouponVO[]>>('/api/coupon/available', { params: { orderAmount } })
}

export function calculateCoupon(data: { userCouponId: number; orderAmount: number }) {
  return request.post<Result<CouponCalculateResultVO>>('/api/coupon/calculate', data)
}
