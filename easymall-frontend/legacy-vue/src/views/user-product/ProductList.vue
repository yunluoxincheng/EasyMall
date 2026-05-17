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
  NCarousel,
  NTag,
  useMessage,
} from 'naive-ui'
import {
  CartOutline,
  FlashOutline,
  GiftOutline,
  GridOutline,
  HeartOutline,
  SearchOutline,
  ShieldCheckmarkOutline,
  StorefrontOutline,
  TicketOutline,
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

const fallbackCategories: CategoryVO[] = [
  { id: -1, name: '手机数码', icon: '', parentId: 0, level: 1, sort: 1, status: 1, createTime: '' },
  { id: -2, name: '家用电器', icon: '', parentId: 0, level: 1, sort: 2, status: 1, createTime: '' },
  { id: -3, name: '服饰鞋包', icon: '', parentId: 0, level: 1, sort: 3, status: 1, createTime: '' },
  { id: -4, name: '美妆个护', icon: '', parentId: 0, level: 1, sort: 4, status: 1, createTime: '' },
  { id: -5, name: '食品生鲜', icon: '', parentId: 0, level: 1, sort: 5, status: 1, createTime: '' },
  { id: -6, name: '家居生活', icon: '', parentId: 0, level: 1, sort: 6, status: 1, createTime: '' },
]

const fallbackStories = [
  { id: 0, name: '品质生活精选', categoryName: '精选', price: '今日上新', image: new URL('@/assets/hero.png', import.meta.url).href },
  { id: 0, name: '会员积分好礼', categoryName: '积分商城', price: '积分可兑', image: new URL('@/assets/hero.png', import.meta.url).href },
  { id: 0, name: '限时优惠专区', categoryName: '优惠券', price: '先领后买', image: new URL('@/assets/hero.png', import.meta.url).href },
  { id: 0, name: '热销口碑榜单', categoryName: '热卖', price: '持续更新', image: new URL('@/assets/hero.png', import.meta.url).href },
]

const query = ref<ProductQuery>({
  pageNum: 1,
  pageSize: 12,
  keyword: (route.query.keyword as string) || '',
  categoryId: route.query.categoryId ? Number(route.query.categoryId) : undefined,
})

const selectedCategoryId = ref<number | string>(query.value.categoryId ? Number(query.value.categoryId) : '')
const keyword = ref(query.value.keyword ?? '')

const featuredCategories = computed(() => categories.value.slice(0, 10))
const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return '全场精选'
  return flattenCategories(categories.value).find((item) => item.id === selectedCategoryId.value)?.name || '分类精选'
})
const hotProducts = computed(() => products.value.slice(0, 4))
const storyItems = computed(() => {
  if (hotProducts.value.length) {
    return hotProducts.value.map((item) => ({
      id: item.id,
      name: item.name,
      categoryName: item.categoryName,
      price: `¥${item.price}`,
      image: item.image,
    }))
  }
  return fallbackStories
})
const heroSlides = computed(() => {
  const items = hotProducts.value.slice(0, 3)
  if (items.length) return items
  return [
    {
      id: 0,
      name: 'EasyMall 品质生活馆',
      subtitle: '每日精选、优惠券和积分福利正在上新',
      price: 0,
      originalPrice: 0,
      stock: 0,
      sales: 0,
      image: '',
      images: [],
      categoryId: 0,
      categoryName: '精选',
      brand: '',
      status: 1,
      createTime: '',
      description: '',
    },
  ] as ProductVO[]
})

function flattenCategories(list: CategoryVO[]) {
  const result: CategoryVO[] = []
  for (const cat of list) {
    result.push(cat)
    if (cat.children?.length) {
      result.push(...cat.children)
    }
  }
  return result
}

function buildCategoryOptions(list: CategoryVO[]) {
  const options: Array<{ label: string; value: number | string }> = [
    { label: '全部分类', value: '' },
  ]
  for (const cat of list) {
    if (cat.id <= 0) continue
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
    categories.value = res.data.data.length ? res.data.data : fallbackCategories
  } catch {
    categories.value = fallbackCategories
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
  query.value.keyword = keyword.value.trim() || undefined
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
  if (id > 0) {
    router.push(`/products/${id}`)
  }
}

function goCategory(id: number) {
  handleCategoryChange(id)
}

watch(
  () => route.query,
  (newQuery) => {
    keyword.value = (newQuery.keyword as string) || ''
    query.value.keyword = keyword.value || undefined
    selectedCategoryId.value = newQuery.categoryId ? Number(newQuery.categoryId) : ''
    query.value.categoryId = typeof selectedCategoryId.value === 'number' ? selectedCategoryId.value : undefined
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
    <section class="storefront-shell">
      <aside class="category-panel">
        <div class="panel-heading">
          <NIcon :component="GridOutline" />
          <span>商品分类</span>
        </div>
        <button
          class="category-row"
          :class="{ active: selectedCategoryId === '' }"
          type="button"
          @click="handleCategoryChange('')"
        >
          <span>全部商品</span>
          <small>All</small>
        </button>
        <button
          v-for="cat in featuredCategories"
          :key="cat.id"
          class="category-row"
          :class="{ active: selectedCategoryId === cat.id }"
          type="button"
          @click="cat.id > 0 ? goCategory(cat.id) : handleCategoryChange('')"
        >
          <span>{{ cat.name }}</span>
          <small>{{ cat.children?.length || 0 }} 个子类</small>
        </button>
      </aside>

      <div class="hero-stage">
        <NCarousel autoplay draggable show-arrow dot-type="line" class="hero-carousel">
          <div v-for="slide in heroSlides" :key="slide.id" class="hero-slide">
            <div class="hero-copy">
              <NTag size="small" type="success" round>{{ slide.categoryName || '精选频道' }}</NTag>
              <h2>{{ slide.id ? slide.name : 'EasyMall 品质生活馆' }}</h2>
              <p>{{ slide.subtitle || '精选热销商品、积分好礼和限时优惠，快速找到更值得买的选择。' }}</p>
              <div class="hero-actions">
                <NButton type="primary" size="large" @click="goProduct(slide.id)">
                  <template #icon>
                    <NIcon :component="StorefrontOutline" />
                  </template>
                  立即选购
                </NButton>
                <NButton secondary size="large" @click="router.push('/coupons')">
                  <template #icon>
                    <NIcon :component="TicketOutline" />
                  </template>
                  领优惠券
                </NButton>
              </div>
            </div>
            <div class="hero-visual">
              <img v-if="slide.image" :src="slide.image" :alt="slide.name" />
              <img v-else src="@/assets/hero.png" alt="EasyMall 商城精选" />
            </div>
          </div>
        </NCarousel>

        <div class="benefit-strip">
          <div class="benefit-item">
            <NIcon :component="ShieldCheckmarkOutline" />
            <span>正品保障</span>
          </div>
          <div class="benefit-item">
            <NIcon :component="FlashOutline" />
            <span>快速下单</span>
          </div>
          <div class="benefit-item">
            <NIcon :component="GiftOutline" />
            <span>积分好礼</span>
          </div>
        </div>
      </div>

      <aside class="quick-panel">
        <div>
          <div class="quick-title">我的 EasyMall</div>
          <div class="quick-subtitle">会员、订单、收藏一站直达</div>
        </div>
        <div class="quick-grid">
          <button type="button" @click="router.push('/cart')">
            <NIcon :component="CartOutline" />
            <span>购物车</span>
          </button>
          <button type="button" @click="router.push('/orders')">
            <NIcon :component="StorefrontOutline" />
            <span>订单</span>
          </button>
          <button type="button" @click="router.push('/user/favorites')">
            <NIcon :component="HeartOutline" />
            <span>收藏</span>
          </button>
          <button type="button" @click="router.push('/user/points/products')">
            <NIcon :component="GiftOutline" />
            <span>积分</span>
          </button>
        </div>
      </aside>
    </section>

    <section class="category-rail" aria-label="快捷分类">
      <button
        class="category-chip"
        :class="{ active: selectedCategoryId === '' }"
        type="button"
        @click="handleCategoryChange('')"
      >
        全部商品
      </button>
      <button
        v-for="cat in flattenCategories(categories).slice(0, 14)"
        :key="cat.id"
        class="category-chip"
        :class="{ active: selectedCategoryId === cat.id }"
        type="button"
        @click="cat.id > 0 ? handleCategoryChange(cat.id) : handleCategoryChange('')"
      >
        {{ cat.name }}
      </button>
    </section>

    <section class="apple-strip">
      <div class="section-heading">
        <div>
          <span class="eyebrow">New Picks</span>
          <h3>上新了，先看这些值得逛的好物。</h3>
        </div>
        <NButton text type="primary" @click="handleSearch">查看全部</NButton>
      </div>
      <div class="story-row">
        <article
          v-for="item in storyItems"
          :key="item.id"
          class="story-card"
          @click="goProduct(item.id)"
        >
          <img :src="item.image" :alt="item.name" />
          <div>
            <span>{{ item.categoryName }}</span>
            <strong>{{ item.name }}</strong>
            <small>{{ item.price }}</small>
          </div>
        </article>
      </div>
    </section>

    <section class="filter-bar">
      <div class="filter-title">
        <span class="eyebrow">{{ selectedCategoryName }}</span>
        <h3>发现商品</h3>
      </div>
      <NSpace align="center" class="filter-controls">
        <NSelect
          :value="selectedCategoryId"
          :options="buildCategoryOptions(categories)"
          placeholder="选择分类"
          class="category-select"
          @update:value="handleCategoryChange"
        />
        <NInput
          v-model:value="keyword"
          placeholder="搜索商品、品牌或关键词"
          clearable
          class="keyword-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <NIcon :component="SearchOutline" />
          </template>
        </NInput>
        <NButton type="primary" @click="handleSearch">筛选</NButton>
      </NSpace>
      <div class="result-count">共 {{ total }} 件商品</div>
    </section>

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
  padding: 0 0 44px;
}

.storefront-shell {
  display: grid;
  grid-template-columns: 214px minmax(0, 1fr) 214px;
  gap: 18px;
  margin-bottom: 98px;
}

.category-panel,
.quick-panel {
  min-height: 394px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #111827;
  font-weight: 700;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}

.category-row small {
  color: #94a3b8;
  white-space: nowrap;
}

.category-row:hover,
.category-row.active {
  background: #f0fdf4;
  color: #047857;
}

.hero-stage {
  min-width: 0;
}

.hero-carousel {
  overflow: hidden;
  min-height: 306px;
  border-radius: 8px;
  background: #f8fafc;
}

.hero-slide {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(240px, 0.98fr);
  min-height: 306px;
  padding: 34px;
  background:
    radial-gradient(circle at 80% 18%, rgba(34, 197, 94, 0.2), transparent 28%),
    linear-gradient(135deg, #f8fafc 0%, #ffffff 42%, #eef6ff 100%);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.hero-copy h2 {
  margin: 12px 0 10px;
  max-width: 540px;
  color: #0f172a;
  font-size: 34px;
  line-height: 1.18;
  font-weight: 800;
}

.hero-copy p {
  margin: 0 0 22px;
  max-width: 500px;
  color: #475569;
  font-size: 15px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.hero-visual img {
  width: min(100%, 330px);
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.benefit-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 76px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  font-weight: 700;
}

.benefit-item :deep(.n-icon) {
  color: #16a34a;
  font-size: 22px;
}

.quick-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(30, 64, 175, 0.88)),
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.28), transparent 32%);
  color: #fff;
}

.quick-title {
  font-size: 18px;
  font-weight: 800;
}

.quick-subtitle {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.5;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quick-grid button {
  display: grid;
  place-items: center;
  min-height: 74px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.quick-grid button:hover {
  border-color: rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.18);
}

.quick-grid :deep(.n-icon) {
  margin-bottom: 6px;
  font-size: 24px;
}

.category-rail {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 16px;
  margin-bottom: 8px;
}

.category-chip {
  min-height: 38px;
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

.apple-strip {
  margin: 0 0 22px;
}

.section-heading,
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.eyebrow {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.section-heading h3,
.filter-title h3 {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.25;
}

.story-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.story-card {
  position: relative;
  min-height: 230px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  background: #f8fafc;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.story-card img {
  width: 100%;
  height: 100%;
  min-height: 230px;
  object-fit: cover;
  transition: transform 0.25s;
}

.story-card:hover img {
  transform: scale(1.03);
}

.story-card div {
  position: absolute;
  inset: auto 14px 14px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}

.story-card span,
.story-card small {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.story-card strong {
  display: block;
  margin: 4px 0;
  color: #111827;
  font-size: 15px;
  line-height: 1.35;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.filter-controls {
  flex: 1;
  justify-content: flex-end;
}

.category-select {
  width: 190px;
}

.keyword-input {
  width: 300px;
}

.result-count {
  color: #64748b;
  font-size: 13px;
  white-space: nowrap;
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
  height: 214px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f8fafc;
}

.product-image-wrap :deep(img) {
  width: 100%;
  height: 214px;
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
  font-weight: 700;
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
  font-size: 19px;
  font-weight: 800;
  color: #dc2626;
}

.price-symbol {
  font-size: 12px;
}

.original-price {
  font-size: 12px;
  color: #94a3b8;
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

@media (prefers-reduced-motion: reduce) {
  .story-card img,
  .product-image-wrap :deep(img),
  .category-chip,
  .quick-grid button {
    transition: none;
  }
}

@media (max-width: 1180px) {
  .storefront-shell {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  .quick-panel {
    grid-column: 1 / -1;
    min-height: auto;
  }

  .quick-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 16px;
  }
}

@media (max-width: 900px) {
  .storefront-shell,
  .hero-slide,
  .story-row {
    grid-template-columns: 1fr;
  }

  .category-panel {
    min-height: auto;
  }

  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-controls {
    justify-content: flex-start;
  }

  .category-select,
  .keyword-input {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-slide {
    padding: 24px;
  }

  .hero-copy h2 {
    font-size: 28px;
  }

  .benefit-strip,
  .quick-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
