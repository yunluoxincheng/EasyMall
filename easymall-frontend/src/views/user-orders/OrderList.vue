<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NImage, NTag, NPagination, NEmpty, NSpin, useMessage } from 'naive-ui'
import { getOrderPage } from '@/api/user-order'
import type { OrderVO, OrderQuery } from '@/types/user-order'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const orders = ref<OrderVO[]>([])
const total = ref(0)

const query = reactive<OrderQuery>({
  pageNum: 1,
  pageSize: 10,
})

const tabs: { label: string; status?: number }[] = [
  { label: '全部' },
  { label: '待支付', status: 0 },
  { label: '已支付', status: 1 },
  { label: '已发货', status: 3 },
  { label: '已完成', status: 4 },
  { label: '已取消', status: 5 },
]

const activeTab = ref<number | undefined>(undefined)

function getStatusType(status: number): 'warning' | 'info' | 'success' | 'error' | 'default' {
  const map: Record<number, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
    0: 'warning',
    1: 'info',
    3: 'success',
    4: 'success',
    5: 'error',
  }
  return map[status] ?? 'default'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderPage(query)
    const page = res.data.data
    orders.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载订单列表失败')
  } finally {
    loading.value = false
  }
}

function handleTabChange(status?: number) {
  activeTab.value = status
  query.status = status
  query.pageNum = 1
  loadData()
}

function handlePageChange(page: number) {
  query.pageNum = page
  loadData()
}

function handlePageSizeChange(pageSize: number) {
  query.pageSize = pageSize
  query.pageNum = 1
  loadData()
}

function goDetail(orderId: number) {
  router.push(`/orders/${orderId}`)
}

onMounted(loadData)
</script>

<template>
  <div class="order-list-page">
    <h2 class="page-title">我的订单</h2>

    <!-- 状态筛选标签栏 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.label"
        :class="['tab-item', { active: activeTab === tab.status }]"
        @click="handleTabChange(tab.status)"
      >
        {{ tab.label }}
      </div>
    </div>

    <NSpin :show="loading">
      <div class="order-content" v-if="orders.length">
        <NCard
          v-for="order in orders"
          :key="order.id"
          hoverable
          class="order-card"
          @click="goDetail(order.id)"
        >
          <div class="order-header">
            <div class="order-meta">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ order.createTime }}</span>
            </div>
            <NTag :type="getStatusType(order.status)" size="small">
              {{ order.statusText }}
            </NTag>
          </div>

          <div class="order-body">
            <div class="product-summary">
              <NImage
                v-if="order.orderItems && order.orderItems.length"
                :src="order.orderItems[0].productImage"
                :preview-disabled="true"
                object-fit="cover"
                class="product-thumb"
                width="72"
                height="72"
              />
              <div class="product-info" v-if="order.orderItems && order.orderItems.length">
                <div class="product-name">{{ order.orderItems[0].productName }}</div>
                <div class="product-qty">x{{ order.orderItems[0].quantity }}</div>
                <div class="product-more" v-if="order.orderItems.length > 1">
                  共 {{ order.orderItems.length }} 种商品
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <span class="order-amount">
              实付：<span class="amount-value">¥{{ order.payAmount }}</span>
            </span>
          </div>
        </NCard>
      </div>

      <NEmpty v-if="!loading && !orders.length" description="暂无订单" />
    </NSpin>

    <div class="pagination-wrap" v-if="total > 0">
      <NPagination
        :page="query.pageNum"
        :page-size="query.pageSize"
        :item-count="total"
        show-size-picker
        :page-sizes="[5, 10, 20]"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.order-list-page {
  padding: 0 0 40px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px;
}

.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}

.tab-item {
  padding: 10px 24px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  user-select: none;
}

.tab-item:hover {
  color: #667eea;
}

.tab-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-no {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-time {
  font-size: 13px;
  color: #999;
}

.order-body {
  display: flex;
  align-items: center;
}

.product-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-thumb {
  border-radius: 6px;
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
}

.product-qty {
  font-size: 13px;
  color: #999;
}

.product-more {
  font-size: 12px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.order-amount {
  font-size: 14px;
  color: #666;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #e4393c;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
