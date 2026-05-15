<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NGrid,
  NGi,
  NEmpty,
  NSpin,
  NTag,
  NTabs,
  NTabPane,
  NButton,
} from 'naive-ui'
import { getMyCoupons } from '@/api/user-coupon'
import type { UserCouponVO } from '@/types/coupon'

const router = useRouter()
const message = useMessage()

const loading = ref(true)
const coupons = ref<UserCouponVO[]>([])
const activeTab = ref('all')

async function loadData() {
  loading.value = true
  try {
    const status = activeTab.value === 'all' ? undefined : Number(activeTab.value)
    const res = await getMyCoupons(status !== undefined ? { status } : {})
    coupons.value = res.data.data.records
  } catch {
    message.error('获取优惠券失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function handleTabChange(tab: string) {
  activeTab.value = tab
  loadData()
}

function formatTime(time: string) {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 10)
}

function getDiscountText(item: UserCouponVO) {
  if (item.type === 1) {
    return `¥${item.discountAmount}`
  }
  return `${item.discountPercentage}折`
}

function getStatusType(status: number) {
  switch (status) {
    case 0: return 'success'
    case 1: return 'default'
    case 2: return 'error'
    default: return 'default'
  }
}
</script>

<template>
  <NSpin :show="loading">
    <div class="user-coupons">
      <h2 class="page-title">我的优惠券</h2>

      <NTabs type="line" @update:value="handleTabChange" :value="activeTab">
        <NTabPane name="all" tab="全部" />
        <NTabPane name="0" tab="可用" />
        <NTabPane name="1" tab="已使用" />
        <NTabPane name="2" tab="已过期" />
      </NTabs>

      <NEmpty v-if="!loading && coupons.length === 0" description="暂无优惠券" style="margin-top: 40px">
        <template #extra>
          <NButton type="primary" @click="router.push('/coupons')">去领取</NButton>
        </template>
      </NEmpty>

      <NGrid :x-gap="16" :y-gap="16" :cols="2" style="margin-top: 16px" v-if="coupons.length">
        <NGi v-for="item in coupons" :key="item.id">
          <NCard class="coupon-card" :class="{ used: item.status !== 0 }">
            <div class="coupon-body">
              <div class="coupon-left">
                <div class="coupon-amount">{{ getDiscountText(item) }}</div>
                <div class="coupon-condition">满{{ item.minAmount }}元可用</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">
                  {{ item.couponName }}
                  <NTag
                    :type="getStatusType(item.status)"
                    size="small"
                    style="margin-left: 8px"
                  >
                    {{ item.statusDesc }}
                  </NTag>
                </div>
                <div class="coupon-type">{{ item.typeDesc }}</div>
                <div class="coupon-validity">
                  {{ formatTime(item.startTime) }} ~ {{ formatTime(item.endTime) }}
                </div>
                <NTag v-if="item.expiringSoon" type="warning" size="small" style="margin-top: 4px">
                  即将过期
                </NTag>
              </div>
            </div>
          </NCard>
        </NGi>
      </NGrid>
    </div>
  </NSpin>
</template>

<style scoped>
.user-coupons {
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

.coupon-card.used {
  border-left-color: #ccc;
  opacity: 0.7;
}

.coupon-body {
  display: flex;
  gap: 20px;
}

.coupon-left {
  min-width: 90px;
  text-align: center;
  padding: 8px 0;
}

.coupon-amount {
  font-size: 26px;
  font-weight: 700;
  color: #e4393c;
}

.coupon-card.used .coupon-amount {
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
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.coupon-type {
  font-size: 12px;
  color: #666;
}

.coupon-validity {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
