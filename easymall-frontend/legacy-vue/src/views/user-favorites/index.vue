<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import {
  NCard,
  NGrid,
  NGi,
  NImage,
  NButton,
  NEmpty,
  NSpin,
  NPagination,
  NSpace,
} from 'naive-ui'
import { getFavoritePage, removeFavorite } from '@/api/user-favorite'
import { addToCart } from '@/api/user-cart'
import type { FavoriteVO } from '@/types/favorite'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(true)
const favorites = ref<FavoriteVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

async function loadData() {
  loading.value = true
  try {
    const res = await getFavoritePage({ pageNum: currentPage.value, pageSize: pageSize.value })
    favorites.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    message.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function handlePageChange(page: number) {
  currentPage.value = page
  loadData()
}

function handleRemove(item: FavoriteVO) {
  dialog.warning({
    title: '取消收藏',
    content: `确定取消收藏「${item.productName}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await removeFavorite(item.productId)
        message.success('已取消收藏')
        loadData()
      } catch {
        message.error('操作失败')
      }
    },
  })
}

async function handleAddToCart(item: FavoriteVO) {
  try {
    await addToCart({ productId: item.productId, quantity: 1 })
    message.success('已加入购物车')
  } catch {
    message.error('加入购物车失败')
  }
}

function goProduct(id: number) {
  router.push(`/products/${id}`)
}
</script>

<template>
  <NSpin :show="loading">
    <div class="favorites-page">
      <h2 class="page-title">我的收藏</h2>

      <NEmpty v-if="!loading && favorites.length === 0" description="暂无收藏商品" />

      <NGrid :x-gap="16" :y-gap="16" :cols="4" v-if="favorites.length">
        <NGi v-for="item in favorites" :key="item.id">
          <NCard hoverable class="fav-card">
            <div class="fav-image" @click="goProduct(item.productId)">
              <NImage :src="item.productImage" object-fit="cover" :preview-disabled="true" />
            </div>
            <div class="fav-name" @click="goProduct(item.productId)">{{ item.productName }}</div>
            <div class="fav-price">¥{{ item.productPrice }}</div>
            <div class="fav-stock" :class="{ 'out-of-stock': item.productStock <= 0 }">
              {{ item.productStock > 0 ? `库存: ${item.productStock}` : '已售罄' }}
            </div>
            <NSpace class="fav-actions" justify="center">
              <NButton
                size="small"
                type="primary"
                :disabled="item.productStock <= 0"
                @click="handleAddToCart(item)"
              >
                加入购物车
              </NButton>
              <NButton size="small" @click="handleRemove(item)">取消收藏</NButton>
            </NSpace>
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
.favorites-page {
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.fav-card {
  cursor: default;
}

.fav-image {
  height: 180px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
}

.fav-image :deep(img) {
  width: 100%;
  height: 180px;
}

.fav-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
  cursor: pointer;
}

.fav-name:hover {
  color: #667eea;
}

.fav-price {
  font-size: 18px;
  font-weight: 600;
  color: #e4393c;
  margin-bottom: 4px;
}

.fav-stock {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.fav-stock.out-of-stock {
  color: #e4393c;
}

.fav-actions {
  margin-top: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
