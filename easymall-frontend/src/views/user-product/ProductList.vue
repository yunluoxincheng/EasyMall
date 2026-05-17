<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton,
  NGrid,
  NGi,
  NCard,
  NImage,
  NPagination,
  NEmpty,
  NSpace,
  NSelect,
  NInput,
  NIcon,
  NSpin,
  useMessage,
} from 'naive-ui'
import {
  FlashOutline,
  GiftOutline,
  ShieldCheckmarkOutline,
  StorefrontOutline,
} from '@vicons/ionicons5'
import { getProductPage } from '@/api/user-product'
import { getCategoryTree } from '@/api/user-category'
import type { ProductVO, CategoryVO, ProductQuery } from '@/types/user-product'

const router = useRouter()
const route = useRoute()
const message = useMessage()

const products = ref<ProductVO[]>([])
const categories = ref<CategoryVO[]>([])
const loading = ref(false)
const total = ref(0)

const query = ref<ProductQuery>({
  pageNum: 1,
  pageSize: 12,
  keyword: (route.query.keyword as string) || '',
  categoryId: route.query.categoryId ? Number(route.query.categoryId) : undefined,
})

const selectedCategoryId = ref<number | string>(query.value.categoryId ? Number(query.value.categoryId) : '')
const keyword = ref(query.value.keyword ?? '')

const featuredCategories = computed(() => categories.value.slice(0, 8))

function buildCategoryOptions(list: CategoryVO[]) {
  const options: Array<{ label: string; value: number | string }> = [
    { label: '全部分类', value: '' },
  ]
  for (const cat of list) {
    options.push({ label: cat.name, value: cat.id })
    if (cat.children?.length) {
      for (const child of cat.children) {
        options.push({ label: `  ${child.name}`, value: child.id })
      }
    }
  }
  return options
}

async function fetchCategories() {
  try {
    const res = await getCategoryTree()
    categories.value = res.data.data
  } catch {
    // ignore
  }
}

async function fetchProducts() {
  loading.value = true
  try {
    const params: ProductQuery = {
      pageNum: query.value.pageNum,
      pageSize: query.value.pageSize,
    }
    if (query.value.keyword) {
      params.keyword = query.value.keyword
    }
    if (query.value.categoryId) {
      params.categoryId = query.value.categoryId
    }
    const res = await getProductPage(params)
    const page = res.data.data
    products.value = page.records
    total.value = page.total
  } catch {
    message.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.value.keyword = keyword.value || undefined
  query.value.categoryId = typeof selectedCategoryId.value === 'number' ? selectedCategoryId.value : undefined
  query.value.pageNum = 1
  fetchProducts()
}

function handleCategoryChange(val: number | string) {
  selectedCategoryId.value = val
  query.value.categoryId = typeof val === 'number' ? val : undefined
  query.value.pageNum = 1
  fetchProducts()
}

function handlePageChange(page: number) {
  query.value.pageNum = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handlePageSizeChange(pageSize: number) {
  query.value.pageSize = pageSize
  query.value.pageNum = 1
  fetchProducts()
}

function goProduct(id: number) {
  router.push(`/products/${id}`)
}

// 监听路由变化（如从首页点击分类跳转）
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.keyword) {
      keyword.value = newQuery.keyword as string
      query.value.keyword = keyword.value
    }
    if (newQuery.categoryId) {
      selectedCategoryId.value = Number(newQuery.categoryId)
      query.value.categoryId = selectedCategoryId.value
    }
    query.value.pageNum = 1
    fetchProducts()
  },
)

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<template>
  <div class="product-list-page">
    <section class="mall-hero">
      <div class="hero-copy">
        <div class="hero-kicker">
          <NIcon :component="StorefrontOutline" />
          精选好物商城
        </div>
        <h2>把日常需要的好东西一次逛齐</h2>
        <p>甄选热销商品、优惠券和积分福利，支持购物车、下单、模拟支付与订单跟踪。</p>
        <div class="hero-search">
          <NInput
            v-model:value="keyword"
            placeholder="搜索手机、家电、服饰、零食"
            clearable
            size="large"
            @keyup.enter="handleSearch"
          />
          <NButton type="primary" size="large" @click="handleSearch">搜索商品</NButton>
        </div>
      </div>
      <div class="hero-panel">
        <div class="panel-title">今日服务</div>
        <div class="service-list">
          <div class="service-item">
            <NIcon :component="ShieldCheckmarkOutline" />
            <span>正品保障</span>
          </div>
          <div class="service-item">
            <NIcon :component="FlashOutline" />
            <span>快速下单</span>
          </div>
          <div class="service-item">
            <NIcon :component="GiftOutline" />
            <span>积分好礼</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="featuredCategories.length" class="category-rail">
      <button
        class="category-chip"
        :class="{ active: selectedCategoryId === '' }"
        type="button"
        @click="handleCategoryChange('')"
      >
        全部商品
      </button>
      <button
        v-for="cat in featuredCategories"
        :key="cat.id"
        class="category-chip"
        :class="{ active: selectedCategoryId === cat.id }"
        type="button"
        @click="handleCategoryChange(cat.id)"
      >
        {{ cat.name }}
      </button>
    </section>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <NSpace align="center">
        <NSelect
          :value="selectedCategoryId"
          :options="buildCategoryOptions(categories)"
          placeholder="选择分类"
          style="width: 200px"
          @update:value="handleCategoryChange"
        />
        <NInput
          v-model:value="keyword"
          placeholder="搜索商品"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
        />
        <NButton type="primary" @click="handleSearch">筛选</NButton>
      </NSpace>
      <div class="result-count">共 {{ total }} 件商品</div>
    </div>

    <!-- 商品网格 -->
    <NSpin :show="loading">
      <div v-if="products.length" class="product-grid">
        <NGrid :x-gap="18" :y-gap="18" cols="1 s:2 m:3 l:4" responsive="screen">
          <NGi v-for="item in products" :key="item.id">
            <NCard hoverable class="product-card" @click="goProduct(item.id)">
              <div class="product-image-wrap">
                <NImage :src="item.image" object-fit="cover" :preview-disabled="true" />
              </div>
              <div class="product-meta-row">
                <span class="category-name">{{ item.categoryName }}</span>
                <span class="product-sales">已售 {{ item.sales }}</span>
              </div>
              <div class="product-name">{{ item.name }}</div>
              <div v-if="item.subtitle" class="product-subtitle">{{ item.subtitle }}</div>
              <div class="product-price">
                <span class="price-symbol">¥</span>{{ item.price }}
                <span v-if="item.originalPrice > item.price" class="original-price">¥{{ item.originalPrice }}</span>
              </div>
            </NCard>
          </NGi>
        </NGrid>
      </div>

      <NEmpty v-if="!loading && !products.length" description="暂无商品" />
    </NSpin>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-wrap">
      <NPagination
        :page="query.pageNum"
        :page-size="query.pageSize"
        :item-count="total"
        :page-sizes="[12, 24, 36]"
        show-size-picker
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.product-list-page {
  padding: 0 0 40px;
}

.mall-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  padding: 32px;
  margin-bottom: 20px;
  border-radius: 8px;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(255, 247, 237, 0.82)),
    url('@/assets/hero.png') center right / cover no-repeat;
  border: 1px solid #f1f5f9;
}

.hero-copy {
  max-width: 680px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 600;
}

.hero-copy h2 {
  margin: 0 0 10px;
  color: #111827;
  font-size: 32px;
  line-height: 1.25;
  font-weight: 700;
}

.hero-copy p {
  margin: 0 0 20px;
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
}

.hero-search {
  display: flex;
  gap: 12px;
  max-width: 560px;
}

.hero-panel {
  align-self: stretch;
  padding: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.panel-title {
  margin-bottom: 14px;
  color: #111827;
  font-weight: 700;
}

.service-list {
  display: grid;
  gap: 10px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
}

.service-item :deep(.n-icon) {
  color: #16a34a;
  font-size: 20px;
}

.category-rail {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 14px;
  margin-bottom: 12px;
}

.category-chip {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.category-chip:hover,
.category-chip.active {
  color: #047857;
  border-color: #86efac;
  background: #ecfdf5;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.result-count {
  color: #64748b;
  font-size: 13px;
}

.product-card {
  cursor: pointer;
  border-radius: 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.product-card:hover {
  border-color: #bbf7d0;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
}

.product-image-wrap {
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f8fafc;
}

.product-image-wrap :deep(img) {
  width: 100%;
  height: 200px;
  transition: transform 0.25s;
}

.product-card:hover .product-image-wrap :deep(img) {
  transform: scale(1.03);
}

.product-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
}

.category-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name {
  min-height: 42px;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 6px;
}

.product-subtitle {
  min-height: 20px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: #64748b;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .mall-hero {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .hero-copy h2 {
    font-size: 26px;
  }

  .hero-search,
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
