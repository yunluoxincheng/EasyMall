<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NGrid,
  NGi,
  NCard,
  NImage,
  NPagination,
  NEmpty,
  NSpace,
  NSelect,
  NInput,
  NSpin,
  useMessage,
} from 'naive-ui'
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
      </NSpace>
    </div>

    <!-- 商品网格 -->
    <NSpin :show="loading">
      <div v-if="products.length" class="product-grid">
        <NGrid :x-gap="16" :y-gap="16" :cols="4">
          <NGi v-for="item in products" :key="item.id">
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
  padding: 20px 0;
}

.filter-bar {
  margin-bottom: 20px;
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
