<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NImage, NModal,
  useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { getProductPage, deleteProduct, updateProductStatus } from '@/api/product'
import type { ProductPageItem, ProductQuery } from '@/types/product'
import ProductForm from './ProductForm.vue'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<ProductPageItem[]>([])
const total = ref(0)
const showForm = ref(false)
const editId = ref<number | null>(null)

const query = reactive<ProductQuery>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  categoryId: undefined,
  status: undefined,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '上架', value: 1 },
  { label: '下架', value: 0 },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getProductPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载商品列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageNum = 1
  loadData()
}

function handlePageChange(page: number) {
  query.pageNum = page
  loadData()
}

function handlePageSizeChange(pageSize: number) {
  query.pageSize = pageSize
  query.pageNum = 1
  loadData()
}

function handleAdd() {
  editId.value = null
  showForm.value = true
}

function handleEdit(row: ProductPageItem) {
  editId.value = row.id
  showForm.value = true
}

function handleToggleStatus(row: ProductPageItem) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  dialog.warning({
    title: '确认操作',
    content: `确定要${action}商品「${row.name}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateProductStatus(row.id, newStatus)
        message.success(`${action}成功`)
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : `${action}失败`)
      }
    },
  })
}

function handleDelete(row: ProductPageItem) {
  dialog.error({
    title: '确认删除',
    content: `确定要删除商品「${row.name}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteProduct(row.id)
        message.success('删除成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

function handleFormSuccess() {
  showForm.value = false
  loadData()
}

const columns: DataTableColumns<ProductPageItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '商品图片', key: 'image', width: 80,
    render: (row) => row.image ? h(NImage, { src: row.image, width: 50, height: 50, objectFit: 'cover', style: { borderRadius: '4px' } }) : '-',
  },
  { title: '商品名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '分类', key: 'categoryName', width: 100 },
  { title: '价格', key: 'price', width: 90,
    render: (row) => `¥${row.price}`,
  },
  { title: '库存', key: 'stock', width: 70 },
  { title: '销量', key: 'sales', width: 70 },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, { default: () => row.status === 1 ? '上架' : '下架' }),
  },
  { title: '创建时间', key: 'createTime', width: 170 },
  { title: '操作', key: 'actions', width: 220, fixed: 'right',
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { text: true, type: 'primary', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { text: true, type: row.status === 1 ? 'warning' : 'success', onClick: () => handleToggleStatus(row) }, { default: () => row.status === 1 ? '下架' : '上架' }),
        h(NButton, { text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ],
    }),
  },
]

import { h } from 'vue'

onMounted(loadData)
</script>

<template>
  <div>
    <NCard>
      <NSpace justify="space-between" align="center" style="margin-bottom: 16px">
        <NSpace>
          <NInput v-model:value="query.name" placeholder="搜索商品名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
          <NSelect v-model:value="query.status" :options="statusOptions" placeholder="状态" clearable style="width: 120px" />
          <NButton type="primary" @click="handleSearch">搜索</NButton>
        </NSpace>
        <NButton type="primary" @click="handleAdd">
          <template #icon><component :is="AddOutline" /></template>
          新增商品
        </NButton>
      </NSpace>

      <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="1200" :row-key="(row: ProductPageItem) => row.id" />

      <NSpace justify="end" style="margin-top: 16px">
        <NPagination
          :page="query.pageNum"
          :page-size="query.pageSize"
          :item-count="total"
          show-size-picker
          :page-sizes="[10, 20, 50]"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </NSpace>
    </NCard>

    <NModal v-model:show="showForm" preset="card" :title="editId ? '编辑商品' : '新增商品'" style="width: 640px" :mask-closable="false">
      <ProductForm :edit-id="editId" @success="handleFormSuccess" @cancel="showForm = false" />
    </NModal>
  </div>
</template>
