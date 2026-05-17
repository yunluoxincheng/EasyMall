<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NCheckbox,
  NImage,
  NInputNumber,
  NButton,
  NEmpty,
  NSpin,
  useMessage,
  useDialog,
} from 'naive-ui'
import { getCartList, updateCartItem, deleteCartItem, selectAllCart, batchSelectCart } from '@/api/user-cart'
import type { CartVO } from '@/types/cart'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const cartList = ref<CartVO[]>([])
const loading = ref(true)

const isAllSelected = computed(() => cartList.value.length > 0 && cartList.value.every((item) => item.selected))

const selectedItems = computed(() => cartList.value.filter((item) => item.selected))

const selectedCount = computed(() => selectedItems.value.length)

const totalPrice = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.totalPrice, 0),
)

onMounted(fetchCartList)

async function fetchCartList() {
  loading.value = true
  try {
    const res = await getCartList()
    cartList.value = res.data.data
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '获取购物车失败')
  } finally {
    loading.value = false
  }
}

async function handleSelectAll(checked: boolean) {
  try {
    await selectAllCart(checked)
    await fetchCartList()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '操作失败')
  }
}

async function handleQuantityChange(item: CartVO, quantity: number | null) {
  if (quantity == null || quantity < 1) return
  try {
    await updateCartItem(item.id, { quantity })
    await fetchCartList()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '修改数量失败')
  }
}

function handleDelete(item: CartVO) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除「${item.productName}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteCartItem(item.id)
        message.success('删除成功')
        await fetchCartList()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

async function handleSelectItem(item: CartVO, checked: boolean) {
  try {
    await batchSelectCart(checked, [item.id])
    await fetchCartList()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '操作失败')
  }
}

function handleCheckout() {
  if (selectedCount.value === 0) {
    message.warning('请至少选择一件商品')
    return
  }
  const cartIds = selectedItems.value.map((item) => item.id).join(',')
  router.push(`/checkout?cartIds=${cartIds}`)
}
</script>

<template>
  <NSpin :show="loading">
    <div class="cart-page">
      <h2 class="page-title">我的购物车</h2>

      <!-- 空状态 -->
      <NEmpty v-if="!loading && cartList.length === 0" description="购物车是空的">
        <template #extra>
          <NButton type="primary" @click="router.push('/products')">去逛逛</NButton>
        </template>
      </NEmpty>

      <!-- 购物车列表 -->
      <div v-if="cartList.length > 0">
        <!-- 表头 -->
        <div class="cart-header">
          <div class="col-check">
            <NCheckbox :checked="isAllSelected" @update:checked="handleSelectAll">全选</NCheckbox>
          </div>
          <div class="col-product">商品信息</div>
          <div class="col-price">单价</div>
          <div class="col-quantity">数量</div>
          <div class="col-total">小计</div>
          <div class="col-action">操作</div>
        </div>

        <!-- 商品行 -->
        <NCard v-for="item in cartList" :key="item.id" class="cart-item" size="small">
          <div class="cart-row">
            <div class="col-check">
              <NCheckbox :checked="item.selected" @update:checked="(val: boolean) => handleSelectItem(item, val)" />
            </div>
            <div class="col-product">
              <div class="product-info">
                <NImage
                  :src="item.productImage"
                  :width="80"
                  :height="80"
                  object-fit="cover"
                  :preview-disabled="true"
                  class="product-image"
                />
                <span class="product-name">{{ item.productName }}</span>
              </div>
            </div>
            <div class="col-price">
              <span class="price">¥{{ item.productPrice.toFixed(2) }}</span>
            </div>
            <div class="col-quantity">
              <NInputNumber
                :value="item.quantity"
                :min="1"
                :max="item.stock"
                size="small"
                style="width: 120px"
                @update:value="(val: number | null) => handleQuantityChange(item, val)"
              />
            </div>
            <div class="col-total">
              <span class="total-price">¥{{ item.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="col-action">
              <NButton text type="error" @click="handleDelete(item)">删除</NButton>
            </div>
          </div>
        </NCard>

        <!-- 底部结算栏 -->
        <div class="cart-footer">
          <div class="footer-left">
            <NCheckbox :checked="isAllSelected" @update:checked="handleSelectAll">全选</NCheckbox>
          </div>
          <div class="footer-right">
            <span class="selected-count">已选 <strong>{{ selectedCount }}</strong> 件商品</span>
            <span class="footer-total">合计：<span class="total-amount">¥{{ totalPrice.toFixed(2) }}</span></span>
            <NButton type="primary" size="large" :disabled="selectedCount === 0" @click="handleCheckout">
              去结算
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
.cart-page {
  padding-bottom: 80px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

/* 表头 */
.cart-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

/* 商品行 */
.cart-item {
  margin-bottom: 12px;
}

.cart-row {
  display: flex;
  align-items: center;
}

.cart-row :deep(.n-card__content) {
  padding: 12px 16px;
}

/* 列宽 */
.col-check {
  width: 60px;
  flex-shrink: 0;
}

.col-product {
  flex: 1;
  min-width: 0;
}

.col-price {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
}

.col-quantity {
  width: 140px;
  text-align: center;
  flex-shrink: 0;
}

.col-total {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
}

.col-action {
  width: 60px;
  text-align: center;
  flex-shrink: 0;
}

/* 商品信息 */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  border-radius: 4px;
  flex-shrink: 0;
}

.product-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 价格 */
.price {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 16px;
  font-weight: 600;
  color: #e4393c;
}

/* 底部结算栏 */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.footer-total {
  font-size: 14px;
  color: #333;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #e4393c;
}
</style>
