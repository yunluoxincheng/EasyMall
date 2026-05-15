<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NCard, NDescriptions, NDescriptionsItem, NResult, NSpin, NSpace, useMessage } from 'naive-ui'
import { getPaymentByPaymentNo, payByPaymentNo } from '@/api/user-payment'
import type { PaymentVO } from '@/types/payment'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const loading = ref(true)
const paying = ref(false)
const paymentInfo = ref<PaymentVO | null>(null)

const paymentNo = route.params.paymentNo as string

const isPaid = ref(false)
const payFailed = ref(false)

async function fetchPayment() {
  loading.value = true
  try {
    const res = await getPaymentByPaymentNo(paymentNo)
    paymentInfo.value = res.data.data
    if (paymentInfo.value.status === 'PAID') {
      isPaid.value = true
    }
  } catch {
    message.error('获取支付信息失败')
    payFailed.value = true
  } finally {
    loading.value = false
  }
}

async function handlePay() {
  paying.value = true
  try {
    const res = await payByPaymentNo(paymentNo)
    paymentInfo.value = res.data.data
    isPaid.value = true
    message.success('支付成功')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '支付失败，请重试'
    message.error(msg)
  } finally {
    paying.value = false
  }
}

function goToOrder() {
  if (paymentInfo.value) {
    router.push(`/orders/${paymentInfo.value.orderId}`)
  }
}

onMounted(() => fetchPayment())
</script>

<template>
  <NSpin :show="loading">
    <div class="payment-page">
      <!-- 支付成功 -->
      <NResult
        v-if="isPaid"
        status="success"
        title="支付成功"
        :sub-title="`订单号：${paymentInfo?.orderNo ?? ''}`"
        class="result-block"
      >
        <template #footer>
          <NSpace justify="center">
            <NButton type="primary" @click="goToOrder">查看订单</NButton>
            <NButton @click="router.push('/products')">继续购物</NButton>
          </NSpace>
        </template>
      </NResult>

      <!-- 加载失败 -->
      <NResult
        v-else-if="payFailed"
        status="error"
        title="支付信息获取失败"
        sub-title="请检查支付链接是否正确"
        class="result-block"
      >
        <template #footer>
          <NButton @click="router.push('/orders')">我的订单</NButton>
        </template>
      </NResult>

      <!-- 待支付 -->
      <template v-else-if="paymentInfo">
        <NCard title="订单支付" class="payment-card">
          <div class="amount-block">
            <div class="amount-label">应付金额</div>
            <div class="amount-value">¥{{ paymentInfo.amount.toFixed(2) }}</div>
          </div>

          <NDivider />

          <NDescriptions label-placement="left" :column="1" bordered>
            <NDescriptionsItem label="订单号">
              {{ paymentInfo.orderNo }}
            </NDescriptionsItem>
            <NDescriptionsItem label="支付单号">
              {{ paymentInfo.paymentNo }}
            </NDescriptionsItem>
            <NDescriptionsItem label="支付状态">
              <span :class="['status-tag', paymentInfo.status === 'PENDING' ? 'pending' : '']">
                {{ paymentInfo.statusText }}
              </span>
            </NDescriptionsItem>
            <NDescriptionsItem label="创建时间">
              {{ paymentInfo.createTime }}
            </NDescriptionsItem>
          </NDescriptions>

          <div class="pay-action">
            <NButton
              type="primary"
              size="large"
              block
              :loading="paying"
              :disabled="paymentInfo.status !== 'PENDING'"
              @click="handlePay"
            >
              {{ paymentInfo.status === 'PENDING' ? '确认支付' : paymentInfo.statusText }}
            </NButton>
          </div>
        </NCard>
      </template>
    </div>
  </NSpin>
</template>

<style scoped>
.payment-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 0;
}

.payment-card {
  border-radius: 8px;
}

.result-block {
  padding: 60px 0;
}

.amount-block {
  text-align: center;
  padding: 24px 0 16px;
}

.amount-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 40px;
  font-weight: 700;
  color: #e4393c;
}

.status-tag {
  font-weight: 500;
}

.status-tag.pending {
  color: #faad14;
}

.pay-action {
  margin-top: 32px;
}
</style>
