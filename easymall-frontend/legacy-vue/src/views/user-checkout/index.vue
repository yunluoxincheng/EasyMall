<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NCard,
  NImage,
  NSpin,
  NEmpty,
  NDivider,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'
import { getCartList } from '@/api/user-cart'
import { createOrder } from '@/api/user-order'
import { getAvailableCoupons, calculateCoupon } from '@/api/user-coupon'
import type { CartVO } from '@/types/cart'
import type { OrderCreateDTO } from '@/types/user-order'
import type { UserCouponVO, CouponCalculateResultVO } from '@/types/coupon'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(true)
const submitting = ref(false)

const selectedCartItems = ref<CartVO[]>([])
const couponList = ref<UserCouponVO[]>([])
const couponResult = ref<CouponCalculateResultVO | null>(null)
const selectedCouponId = ref<number | null>(null)

const formData = reactive({
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  remark: '',
})

const rules: FormRules = {
  receiverName: { required: true, message: '请输入收货人姓名', trigger: 'blur' },
  receiverPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  receiverAddress: { required: true, message: '请输入收货地址', trigger: 'blur' },
}

const cartIds = computed(() => {
  const query = route.query.cartIds
  if (!query) return []
  if (Array.isArray(query)) return query.map(Number)
  return String(query)
    .split(',')
    .map(Number)
    .filter((id) => !isNaN(id))
})

const totalAmount = computed(() =>
  selectedCartItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
)

const discountAmount = computed(() => {
  if (couponResult.value && couponResult.value.available) {
    return couponResult.value.discountAmount
  }
  return 0
})

const payAmount = computed(() => Math.max(totalAmount.value - discountAmount.value, 0))

const couponOptions = computed<SelectOption[]>(() =>
  couponList.value.map((c) => ({
    label: `${c.couponName}（${c.typeDesc}）`,
    value: c.id,
  }))
)

async function fetchData() {
  loading.value = true
  try {
    const cartRes = await getCartList()
    const allItems = cartRes.data.data
    selectedCartItems.value = allItems.filter((item) => cartIds.value.includes(item.id))
    const amount = selectedCartItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
    if (amount > 0) {
      try {
        const couponRes = await getAvailableCoupons(amount)
        couponList.value = couponRes.data.data
      } catch {
        couponList.value = []
      }
    }
  } catch {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

async function handleCouponChange(value: number) {
  selectedCouponId.value = value
  couponResult.value = null

  if (!value) return

  try {
    const res = await calculateCoupon({ userCouponId: value, orderAmount: totalAmount.value })
    couponResult.value = res.data.data
    if (!couponResult.value.available) {
      message.warning(couponResult.value.unavailableReason || '该优惠券不可用')
    }
  } catch {
    message.error('计算优惠失败')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (selectedCartItems.value.length === 0) {
    message.warning('没有选中的商品')
    return
  }

  submitting.value = true
  try {
    const data: OrderCreateDTO = {
      cartIds: cartIds.value,
      receiverName: formData.receiverName,
      receiverPhone: formData.receiverPhone,
      receiverAddress: formData.receiverAddress,
    }
    if (formData.remark) {
      data.remark = formData.remark
    }
    if (selectedCouponId.value) {
      data.userCouponId = selectedCouponId.value
    }
    const res = await createOrder(data)
    const { paymentNo } = res.data.data
    message.success('订单创建成功')
    router.push(`/payment/${paymentNo}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '创建订单失败'
    message.error(msg)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (cartIds.value.length === 0) {
    message.warning('未选择商品，请返回购物车选择')
    router.replace('/cart')
    return
  }
  fetchData()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="checkout-page">
      <h2 class="page-title">确认订单</h2>

      <NEmpty v-if="!loading && selectedCartItems.length === 0" description="没有选中的商品" />

      <template v-else>
        <!-- 商品列表 -->
        <NCard title="商品清单" class="section-card">
          <div class="cart-list">
            <div v-for="item in selectedCartItems" :key="item.id" class="cart-item">
              <div class="item-image">
                <NImage :src="item.productImage" object-fit="cover" :preview-disabled="true" width="80" height="80" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-price">¥{{ item.productPrice }} x {{ item.quantity }}</div>
              </div>
              <div class="item-total">¥{{ item.totalPrice.toFixed(2) }}</div>
            </div>
          </div>
        </NCard>

        <!-- 收货信息 -->
        <NCard title="收货信息" class="section-card">
          <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="100">
            <NFormItem label="收货人" path="receiverName">
              <NInput v-model:value="formData.receiverName" placeholder="请输入收货人姓名" />
            </NFormItem>
            <NFormItem label="手机号" path="receiverPhone">
              <NInput v-model:value="formData.receiverPhone" placeholder="请输入手机号" maxlength="11" />
            </NFormItem>
            <NFormItem label="收货地址" path="receiverAddress">
              <NInput v-model:value="formData.receiverAddress" type="textarea" placeholder="请输入详细收货地址" :rows="2" />
            </NFormItem>
            <NFormItem label="备注" path="remark">
              <NInput v-model:value="formData.remark" placeholder="选填，如特殊备注信息" />
            </NFormItem>
          </NForm>
        </NCard>

        <!-- 优惠券选择 -->
        <NCard title="优惠券" class="section-card">
          <NSelect
            v-model:value="selectedCouponId"
            :options="couponOptions"
            placeholder="选择优惠券（可选）"
            clearable
            @update:value="handleCouponChange"
          />
          <p v-if="couponResult && !couponResult.available" class="coupon-warning">
            {{ couponResult.unavailableReason }}
          </p>
        </NCard>

        <!-- 金额汇总 -->
        <NCard class="section-card summary-card">
          <div class="summary-row">
            <span>商品总额：</span>
            <span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row" v-if="discountAmount > 0">
            <span>优惠金额：</span>
            <span class="amount discount">-¥{{ discountAmount.toFixed(2) }}</span>
          </div>
          <NDivider />
          <div class="summary-row final">
            <span>应付金额：</span>
            <span class="amount final-amount">¥{{ payAmount.toFixed(2) }}</span>
          </div>
        </NCard>

        <!-- 提交按钮 -->
        <div class="submit-bar">
          <NSpace justify="end">
            <NButton @click="router.back()">返回购物车</NButton>
            <NButton type="primary" size="large" :loading="submitting" @click="handleSubmit">
              提交订单
            </NButton>
          </NSpace>
        </div>
      </template>
    </div>
  </NSpin>
</template>

<style scoped>
.checkout-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 24px;
  color: #333;
}

.section-card {
  margin-bottom: 16px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.item-image {
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.item-price {
  font-size: 13px;
  color: #999;
}

.item-total {
  font-size: 16px;
  font-weight: 600;
  color: #e4393c;
  flex-shrink: 0;
}

.coupon-warning {
  margin: 8px 0 0;
  font-size: 13px;
  color: #e4393c;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
  line-height: 2;
}

.summary-row.final {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.amount {
  font-weight: 500;
}

.amount.discount {
  color: #e4393c;
}

.amount.final-amount {
  font-size: 22px;
  color: #e4393c;
}

.submit-bar {
  margin-top: 24px;
}
</style>
