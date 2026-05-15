<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NImage,
  NButton,
  NInputNumber,
  NEmpty,
  NSpace,
  NRate,
  NSpin,
  NPagination,
  useMessage,
} from 'naive-ui'
import { getProductById } from '@/api/user-product'
import { addToCart, getCartList } from '@/api/user-cart'
import { toggleFavorite, checkFavorite } from '@/api/user-favorite'
import { getProductComments } from '@/api/user-comment'
import { useUserAuthStore } from '@/stores/userAuth'
import type { ProductVO } from '@/types/user-product'
import type { UserCommentVO } from '@/types/comment'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userAuth = useUserAuthStore()

const product = ref<ProductVO | null>(null)
const loading = ref(true)
const notFound = ref(false)
const quantity = ref(1)
const isFavorite = ref(false)
const favoriteLoading = ref(false)
const addCartLoading = ref(false)

// 图片轮播
const currentImageIndex = ref(0)
const allImages = ref<string[]>([])

// 评论区
const comments = ref<UserCommentVO[]>([])
const commentTotal = ref(0)
const commentPageNum = ref(1)
const commentPageSize = ref(10)
const commentsLoading = ref(false)

function getProductId(): number {
  return Number(route.params.id)
}

async function fetchProduct() {
  loading.value = true
  notFound.value = false
  try {
    const id = getProductId()
    const res = await getProductById(id)
    product.value = res.data.data
    if (!product.value) {
      notFound.value = true
      return
    }
    // 组装图片列表
    const imgs: string[] = []
    if (product.value.image) {
      imgs.push(product.value.image)
    }
    if (product.value.images?.length) {
      for (const img of product.value.images) {
        if (img && !imgs.includes(img)) {
          imgs.push(img)
        }
      }
    }
    allImages.value = imgs
    currentImageIndex.value = 0
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function fetchFavoriteStatus() {
  if (!userAuth.isLoggedIn) return
  try {
    const id = getProductId()
    const res = await checkFavorite(id)
    isFavorite.value = res.data.data
  } catch {
    // ignore
  }
}

async function fetchComments() {
  commentsLoading.value = true
  try {
    const id = getProductId()
    const res = await getProductComments(id, {
      pageNum: commentPageNum.value,
      pageSize: commentPageSize.value,
    })
    const page = res.data.data
    comments.value = page.records
    commentTotal.value = page.total
  } catch {
    // ignore
  } finally {
    commentsLoading.value = false
  }
}

async function handleAddToCart() {
  if (!userAuth.isLoggedIn) {
    message.info('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  addCartLoading.value = true
  try {
    await addToCart({ productId: getProductId(), quantity: quantity.value })
    message.success('已加入购物车')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加入购物车失败'
    message.error(msg)
  } finally {
    addCartLoading.value = false
  }
}

const buyNowLoading = ref(false)

async function handleBuyNow() {
  if (!userAuth.isLoggedIn) {
    message.info('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  buyNowLoading.value = true
  try {
    await addToCart({ productId: getProductId(), quantity: quantity.value })
    const cartRes = await getCartList()
    const cartItem = cartRes.data.data.find((c) => c.productId === getProductId())
    if (cartItem) {
      router.push({ path: '/checkout', query: { cartIds: String(cartItem.id) } })
    } else {
      message.error('未找到购物车记录')
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '操作失败'
    message.error(msg)
  } finally {
    buyNowLoading.value = false
  }
}

async function handleToggleFavorite() {
  if (!userAuth.isLoggedIn) {
    message.info('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  favoriteLoading.value = true
  try {
    const res = await toggleFavorite(getProductId())
    isFavorite.value = res.data.data
    message.success(isFavorite.value ? '已收藏' : '已取消收藏')
  } catch {
    message.error('操作失败')
  } finally {
    favoriteLoading.value = false
  }
}

function handleCommentPageChange(page: number) {
  commentPageNum.value = page
  fetchComments()
}


onMounted(() => {
  fetchProduct()
  fetchFavoriteStatus()
  fetchComments()
})
</script>

<template>
  <div class="product-detail-page">
    <NSpin :show="loading">
      <!-- 商品不存在 -->
      <NEmpty v-if="!loading && notFound" description="商品不存在">
        <template #extra>
          <NButton type="primary" @click="router.push('/products')">返回商品列表</NButton>
        </template>
      </NEmpty>

      <!-- 商品详情 -->
      <div v-if="product" class="detail-content">
        <div class="detail-main">
          <!-- 左侧：图片 -->
          <div class="image-section">
            <div class="main-image">
              <NImage
                v-if="allImages.length"
                :src="allImages[currentImageIndex]"
                object-fit="contain"
                class="main-image-inner"
              />
            </div>
            <div class="thumb-list" v-if="allImages.length > 1">
              <div
                v-for="(img, idx) in allImages"
                :key="idx"
                class="thumb-item"
                :class="{ active: idx === currentImageIndex }"
                @click="currentImageIndex = idx"
              >
                <NImage :src="img" object-fit="cover" :preview-disabled="true" />
              </div>
            </div>
          </div>

          <!-- 右侧：商品信息 -->
          <div class="info-section">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</div>

            <div class="price-block">
              <span class="current-price">
                <span class="price-symbol">¥</span>{{ product.price }}
              </span>
              <span v-if="product.originalPrice > product.price" class="original-price">
                ¥{{ product.originalPrice }}
              </span>
            </div>

            <div class="meta-info">
              <div class="meta-item">
                <span class="meta-label">库存</span>
                <span class="meta-value">{{ product.stock }} 件</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">销量</span>
                <span class="meta-value">{{ product.sales }} 件</span>
              </div>
              <div class="meta-item" v-if="product.brand">
                <span class="meta-label">品牌</span>
                <span class="meta-value">{{ product.brand }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">分类</span>
                <span class="meta-value">{{ product.categoryName }}</span>
              </div>
            </div>

            <!-- 数量 & 操作 -->
            <div class="action-bar">
              <div class="quantity-row">
                <span class="action-label">数量</span>
                <NInputNumber
                  v-model:value="quantity"
                  :min="1"
                  :max="product.stock"
                  style="width: 140px"
                />
              </div>
              <NSpace>
                <NButton
                  type="primary"
                  size="large"
                  :loading="addCartLoading"
                  :disabled="product.stock === 0"
                  @click="handleAddToCart"
                >
                  {{ product.stock === 0 ? '已售罄' : '加入购物车' }}
                </NButton>
                <NButton
                  type="warning"
                  size="large"
                  :loading="buyNowLoading"
                  :disabled="product.stock === 0"
                  @click="handleBuyNow"
                >
                  {{ product.stock === 0 ? '已售罄' : '立即购买' }}
                </NButton>
                <NButton
                  size="large"
                  :loading="favoriteLoading"
                  @click="handleToggleFavorite"
                >
                  {{ isFavorite ? '已收藏' : '收藏' }}
                </NButton>
              </NSpace>
            </div>
          </div>
        </div>

        <!-- 商品描述 -->
        <div class="description-section" v-if="product.description">
          <h2 class="section-title">商品描述</h2>
          <div class="description-content">{{ product.description }}</div>
        </div>

        <!-- 评论区 -->
        <div class="comment-section">
          <h2 class="section-title">用户评价（{{ commentTotal }}）</h2>
          <NSpin :show="commentsLoading">
            <div v-if="comments.length" class="comment-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.userNickname || '匿名用户' }}</span>
                  <NRate :value="comment.rating" readonly size="small" />
                  <span class="comment-time">{{ comment.createTime }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div v-if="comment.reply" class="comment-reply">
                  <span class="reply-label">商家回复：</span>{{ comment.reply }}
                </div>
              </div>
            </div>
            <NEmpty v-if="!commentsLoading && !comments.length" description="暂无评价" />
          </NSpin>
          <div v-if="commentTotal > commentPageSize" class="pagination-wrap">
            <NPagination
              :page="commentPageNum"
              :page-size="commentPageSize"
              :item-count="commentTotal"
              @update:page="handleCommentPageChange"
            />
          </div>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.product-detail-page {
  padding: 20px 0;
}

.detail-main {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}

/* 图片区域 */
.image-section {
  width: 420px;
  flex-shrink: 0;
}

.main-image {
  width: 420px;
  height: 420px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.main-image :deep(img) {
  max-width: 100%;
  max-height: 100%;
}

.thumb-list {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.thumb-item {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.thumb-item:hover,
.thumb-item.active {
  border-color: #667eea;
}

.thumb-item :deep(img) {
  width: 100%;
  height: 100%;
}

/* 信息区域 */
.info-section {
  flex: 1;
}

.product-name {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
  line-height: 1.4;
}

.product-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.price-block {
  background: #fef0f0;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #e4393c;
}

.price-symbol {
  font-size: 16px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}

.meta-item {
  font-size: 14px;
}

.meta-label {
  color: #999;
  margin-right: 8px;
}

.meta-value {
  color: #333;
}

.action-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-label {
  font-size: 14px;
  color: #999;
}

/* 描述区域 */
.description-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.description-content {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 评论区 */
.comment-section {
  margin-bottom: 32px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-user {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.comment-content {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.comment-reply {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.reply-label {
  color: #999;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
