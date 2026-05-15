<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NGrid,
  NGi,
  NButton,
  NEmpty,
  NSpin,
  NPagination,
  NTag,
} from 'naive-ui'
import { getCouponTemplates, receiveCoupon } from '@/api/user-coupon'
import type { CouponTemplateVO } from '@/types/coupon'

const message = useMessage()

const loading = ref(true)
const coupons = ref<CouponTemplateVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

async function loadData() {
  loading.value = true
  try {
    const res = await getCouponTemplates()
    coupons.value = res.data.data
    total.value = res.data.data.length
  } catch {
    message.error('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function handlePageChange(page: number) {
  currentPage.value = page
  loadData()
}

function formatTime(time: string) {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 10)
}

async function handleReceive(item: CouponTemplateVO) {
  try {
    await receiveCoupon(item.id)
    message.success('领取成功')
    loadData()
  } catch {
    message.error('领取失败')
  }
}

function getDiscountText(item: CouponTemplateVO) {
  if (item.type === 1) {
    return `¥${item.discountAmount}`
  }
  return `${item.discountPercentage}折`
}
</script>

<template>
  <NSpin :show="loading">
    <div class="coupon-center">
      <h2 class="page-title">优惠券中心</h2>

      <NEmpty v-if="!loading && coupons.length === 0" description="暂无可领取的优惠券" />

      <NGrid :x-gap="16" :y-gap="16" :cols="2" v-if="coupons.length">
        <NGi v-for="item in coupons" :key="item.id">
          <NCard class="coupon-card" :class="{ received: item.receivedCount > 0 }">
            <div class="coupon-body">
              <div class="coupon-left">
                <div class="coupon-amount">{{ getDiscountText(item) }}</div>
                <div class="coupon-condition">
                  满{{ item.minAmount }}元可用
                </div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ item.name }}</div>
                <NTag size="small" :type="item.type === 1 ? 'warning' : 'success'">
                  {{ item.typeDesc }}
                </NTag>
                <div class="coupon-validity">
                  {{ formatTime(item.startTime) }} ~ {{ formatTime(item.endTime) }}
                </div>
                <div class="coupon-desc" v-if="item.description">{{ item.description }}</div>
                <div class="coupon-stock">
                  剩余 {{ item.remainingCount }} 张
                </div>
                <NButton
                  v-if="item.receivedCount === 0"
                  type="primary"
                  size="small"
                  :disabled="item.remainingCount <= 0"
                  @click="handleReceive(item)"
                >
                  {{ item.remainingCount > 0 ? '立即领取' : '已抢光' }}
                </NButton>
                <NTag v-else type="default" size="small">已领取</NTag>
              </div>
            </div>
          </NCard>
        </NGi>
      </NGrid>

      <div class="pagination-wrap" v-if="total > pageSize">
        <NPagination
          v-model:page="currentPage"
          :page-size="pageSize"
          :item-count="total"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
.coupon-center {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.coupon-card {
  border-left: 4px solid #e4393c;
}

.coupon-card.received {
  border-left-color: #ccc;
  opacity: 0.75;
}

.coupon-body {
  display: flex;
  gap: 20px;
}

.coupon-left {
  min-width: 100px;
  text-align: center;
  padding: 8px 0;
}

.coupon-amount {
  font-size: 28px;
  font-weight: 700;
  color: #e4393c;
}

.coupon-card.received .coupon-amount {
  color: #999;
}

.coupon-condition {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.coupon-right {
  flex: 1;
}

.coupon-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.coupon-validity {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.coupon-desc {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.coupon-stock {
  font-size: 12px;
  color: #f0a020;
  margin-top: 4px;
  margin-bottom: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
