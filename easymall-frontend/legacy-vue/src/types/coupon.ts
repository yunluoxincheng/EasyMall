import type { MyBatisPage } from './api'

export interface CouponTemplateVO {
  id: number
  name: string
  type: number
  typeDesc: string
  discountAmount: number
  discountPercentage: number
  minAmount: number
  maxDiscount: number
  totalCount: number
  receivedCount: number
  usedCount: number
  remainingCount: number
  receiveRate: number
  usageRate: number
  memberLevel: number
  validDays: number
  startTime: string
  endTime: string
  sortOrder: number
  status: number
  statusDesc: string
  description: string
}

export interface CouponTemplateDTO {
  id?: number
  name: string
  type: number | null
  discountAmount: number | null
  discountPercentage: number | null
  minAmount: number | null
  maxDiscount: number | null
  totalCount: number | null
  memberLevel: number
  validDays: number
  startTime: string
  endTime: string
  sortOrder: number
  status: number
  description: string
}

export interface CouponQuery {
  pageNum: number
  pageSize: number
  name?: string
  type?: number
  status?: number
}

export interface CouponUsageLogVO {
  id: number
  userId: number
  userCouponId: number
  templateId: number
  couponName: string
  couponType: number
  couponTypeDesc: string
  orderId: number
  orderNo: string
  orderAmount: number
  discountAmount: number
  action: number
  actionDesc: string
  createTime: string
}

export interface UsageLogQuery {
  templateId?: number
  userId?: number
  pageNum: number
  pageSize: number
}

export type CouponStatistics = Record<string, unknown>

export type CouponTemplatePage = MyBatisPage<CouponTemplateVO>
export type UsageLogPage = MyBatisPage<CouponUsageLogVO>

// 用户端优惠券类型
export interface UserCouponVO {
  id: number
  templateId: number
  couponCode: string
  couponName: string
  type: number
  typeDesc: string
  discountAmount: number
  discountPercentage: number
  minAmount: number
  maxDiscount: number
  startTime: string
  endTime: string
  status: number
  statusDesc: string
  useTime: string
  orderId: number
  orderNo: string
  receiveTime: string
  expiringSoon: boolean
}

export interface CouponCalculateResultVO {
  userCouponId: number
  couponName: string
  type: number
  typeDesc: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  available: boolean
  unavailableReason: string
}
