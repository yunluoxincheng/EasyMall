import request from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { PointsRecordVO } from '@/types/points'

export function getPointsRecords(params: { pageNum?: number; pageSize?: number }) {
  return request.get<Result<PageResult<PointsRecordVO>>>('/api/points/records', { params })
}
