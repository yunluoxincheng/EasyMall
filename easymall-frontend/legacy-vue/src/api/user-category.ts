import request from '@/utils/request'
import type { Result } from '@/types/api'
import type { CategoryVO } from '@/types/user-product'

export function getCategoryTree() {
  return request.get<Result<CategoryVO[]>>('/api/category/tree')
}
