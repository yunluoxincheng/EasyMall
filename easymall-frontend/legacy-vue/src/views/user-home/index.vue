<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NGrid, NGi, NCard, NImage, NSpin, NEmpty } from 'naive-ui'
import { getHotProducts, getNewProducts } from '@/api/user-product'
import { getCategoryTree } from '@/api/user-category'
import type { ProductVO, CategoryVO } from '@/types/user-product'

const router = useRouter()
const hotProducts = ref<ProductVO[]>([])
const newProducts = ref<ProductVO[]>([])
const categories = ref<CategoryVO[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [hotRes, newRes, catRes] = await Promise.all([
      getHotProducts(8),
      getNewProducts(8),
      getCategoryTree(),
    ])
    hotProducts.value = hotRes.data.data
    newProducts.value = newRes.data.data
    categories.value = catRes.data.data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})

function goProduct(id: number) {
  router.push(`/products/${id}`)
}

function goCategory(id: number) {
  router.push({ path: '/products', query: { categoryId: String(id) } })
}
</script>

<template>
  <NSpin :show="loading">
    <div class="home-page">
      <!-- 分类导航 -->
      <div class="section" v-if="categories.length">
        <h2 class="section-title">商品分类</h2>
        <div class="category-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            @click="goCategory(cat.id)"
          >
            {{ cat.name }}
          </div>
        </div>
      </div>

      <!-- 热门商品 -->
      <div class="section" v-if="hotProducts.length">
        <h2 class="section-title">热门商品</h2>
        <NGrid :x-gap="16" :y-gap="16" :cols="4">
          <NGi v-for="item in hotProducts" :key="item.id">
            <NCard hoverable class="product-card" @click="goProduct(item.id)">
              <div class="product-image-wrap">
                <NImage :src="item.image" object-fit="cover" :preview-disabled="true" />
              </div>
              <div class="product-name">{{ item.name }}</div>
              <div class="product-price">
                <span class="price-symbol">¥</span>{{ item.price }}
                <span v-if="item.originalPrice > item.price" class="original-price">¥{{ item.originalPrice }}</span>
              </div>
              <div class="product-sales">已售 {{ item.sales }}</div>
            </NCard>
          </NGi>
        </NGrid>
      </div>

      <!-- 新品推荐 -->
      <div class="section" v-if="newProducts.length">
        <h2 class="section-title">新品推荐</h2>
        <NGrid :x-gap="16" :y-gap="16" :cols="4">
          <NGi v-for="item in newProducts" :key="item.id">
            <NCard hoverable class="product-card" @click="goProduct(item.id)">
              <div class="product-image-wrap">
                <NImage :src="item.image" object-fit="cover" :preview-disabled="true" />
              </div>
              <div class="product-name">{{ item.name }}</div>
              <div class="product-price">
                <span class="price-symbol">¥</span>{{ item.price }}
              </div>
            </NCard>
          </NGi>
        </NGrid>
      </div>

      <NEmpty v-if="!loading && !hotProducts.length && !newProducts.length" description="暂无商品" />
    </div>
  </NSpin>
</template>

<style scoped>
.home-page {
  padding-bottom: 40px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-item {
  padding: 8px 20px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #667eea;
  color: #fff;
}

.product-card {
  cursor: pointer;
}

.product-image-wrap {
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 8px;
}

.product-image-wrap :deep(img) {
  width: 100%;
  height: 200px;
}

.product-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #e4393c;
}

.price-symbol {
  font-size: 12px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  font-weight: normal;
  margin-left: 6px;
}

.product-sales {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>
