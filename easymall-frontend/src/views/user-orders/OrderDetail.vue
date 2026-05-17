<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard, NImage, NTag, NButton, NSpace, NDescriptions, NDescriptionsItem,
  NSpin, NDivider, useMessage, useDialog,
} from 'naive-ui'
import { getOrderById, cancelOrder, confirmOrder, getOrderPayment } from '@/api/user-order'
import type { OrderVO } from '@/types/user-order'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const order = ref<OrderVO | null>(null)

const orderId = Number(route.params.id)

function getStatusType(status: number): 'warning' | 'info' | 'success' | 'error' | 'default' {
  const map: Record<number, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
    0: 'warning',
    1: 'info',
    2: 'success',
    3: 'success',
    4: 'error',
    5: 'warning',
  }
  return map[status] ?? 'default'
}

async function loadOrder() {
  loading.value = true
  try {
    const res = await getOrderById(orderId)
    order.value = res.data.data
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载订单详情失败')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  dialog.error({
    title: '确认取消',
    content: '确定要取消该订单吗？此操作不可恢复。',
    positiveText: '确认取消',
    negativeText: '返回',
    onPositiveClick: async () => {
      try {
        await cancelOrder(orderId)
        message.success('订单已取消')
        loadOrder()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '取消订单失败')
      }
    },
  })
}

function handleConfirm() {
  dialog.success({
    title: '确认收货',
    content: '确认已收到商品吗？',
    positiveText: '确认收货',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await confirmOrder(orderId)
        message.success('已确认收货')
        loadOrder()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '确认收货失败')
      }
    },
  })
}

function handleReview() {
  // 评论功能暂未实现，仅保留按钮入口
  message.info('评论功能暂未开放')
}

async function handlePay() {
  try {
    const res = await getOrderPayment(orderId)
    router.push(`/payment/${res.data.data.paymentNo}`)
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '获取支付信息失败')
  }
}

function goBack() {
  router.push('/orders')
}

onMounted(loadOrder)
</script>

<template>
  <div class="order-detail-page">
    <NSpin :show="loading">
      <template v-if="order">
        <!-- 订单基本信息 -->
        <NCard class="section-card">
          <div class="section-header">
            <div class="back-btn" @click="goBack">&lt; 返回订单列表</div>
            <h3 class="section-title">订单信息</h3>
          </div>
          <NDescriptions bordered :column="2" label-style="width: 100px">
            <NDescriptionsItem label="订单号">{{ order.orderNo }}</NDescriptionsItem>
            <NDescriptionsItem label="状态">
              <NTag :type="getStatusType(order.status)" size="small">
                {{ order.statusText }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="下单时间">{{ order.createTime }}</NDescriptionsItem>
            <NDescriptionsItem label="支付时间">{{ order.payTime || '-' }}</NDescriptionsItem>
          </NDescriptions>
        </NCard>

        <!-- 商品列表 -->
        <NCard class="section-card">
          <h3 class="section-title">商品清单</h3>
          <div class="item-list">
            <div
              v-for="item in order.orderItems"
              :key="item.id"
              class="order-item"
            >
              <NImage
                :src="item.productImage"
                :preview-disabled="true"
                object-fit="cover"
                class="item-image"
                width="80"
                height="80"
              />
              <div class="item-detail">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-price-row">
                  <span class="item-unit-price">¥{{ item.productPrice }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                  <span class="item-subtotal">¥{{ item.totalPrice }}</span>
                </div>
              </div>
              <div class="item-action" v-if="order.status === 3">
                <NButton size="small" type="primary" @click="handleReview">
                  评价
                </NButton>
              </div>
            </div>
          </div>
        </NCard>

        <!-- 收货信息 -->
        <NCard class="section-card">
          <h3 class="section-title">收货信息</h3>
          <NDescriptions bordered :column="2" label-style="width: 100px">
            <NDescriptionsItem label="收货人">{{ order.receiverName }}</NDescriptionsItem>
            <NDescriptionsItem label="联系电话">{{ order.receiverPhone }}</NDescriptionsItem>
            <NDescriptionsItem label="收货地址" :span="2">{{ order.receiverAddress }}</NDescriptionsItem>
          </NDescriptions>
        </NCard>

        <!-- 备注 -->
        <NCard class="section-card" v-if="order.remark">
          <h3 class="section-title">备注</h3>
          <div class="remark-content">{{ order.remark }}</div>
        </NCard>

        <!-- 金额汇总 -->
        <NCard class="section-card">
          <h3 class="section-title">金额汇总</h3>
          <div class="amount-summary">
            <div class="amount-row">
              <span class="amount-label">商品总额</span>
              <span class="amount-value">¥{{ order.totalAmount }}</span>
            </div>
            <NDivider style="margin: 8px 0" />
            <div class="amount-row highlight">
              <span class="amount-label">实付金额</span>
              <span class="amount-value final">¥{{ order.payAmount }}</span>
            </div>
          </div>
        </NCard>

        <!-- 操作按钮 -->
        <NCard class="section-card" v-if="order.status === 0 || order.status === 2 || order.status === 3">
          <div class="action-bar">
            <NSpace>
              <NButton v-if="order.status === 0" type="primary" @click="handlePay">
                去支付
              </NButton>
              <NButton v-if="order.status === 0" type="error" @click="handleCancel">
                取消订单
              </NButton>
              <NButton v-if="order.status === 2" type="success" @click="handleConfirm">
                确认收货
              </NButton>
            </NSpace>
          </div>
        </NCard>
      </template>
    </NSpin>
  </div>
</template>

<style scoped>
.order-detail-page {
  padding: 0 0 40px;
}

.section-card {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.back-btn {
  font-size: 14px;
  color: #667eea;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.8;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.section-header .section-title {
  margin: 0;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.item-image {
  border-radius: 6px;
  flex-shrink: 0;
}

.item-detail {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.item-unit-price {
  color: #666;
}

.item-qty {
  color: #999;
}

.item-subtotal {
  color: #e4393c;
  font-weight: 600;
}

.item-action {
  flex-shrink: 0;
}

.remark-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
}

.amount-summary {
  max-width: 320px;
  margin-left: auto;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.amount-label {
  font-size: 14px;
  color: #666;
}

.amount-value {
  font-size: 14px;
  color: #333;
}

.amount-row.highlight .amount-label {
  font-weight: 600;
  color: #333;
}

.amount-row.highlight .amount-value {
  font-size: 20px;
  font-weight: 700;
  color: #e4393c;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
