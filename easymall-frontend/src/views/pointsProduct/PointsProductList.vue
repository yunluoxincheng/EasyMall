<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NModal, NForm,
  NFormItem, NInputNumber, useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { getPointsProductPage, createPointsProduct, updatePointsProduct, updatePointsProductStatus, deletePointsProduct } from '@/api/pointsProduct'
import type { PointsProductPageItem, PointsProductFormData, PointsProductQuery } from '@/types/pointsProduct'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<PointsProductPageItem[]>([])
const total = ref(0)
const showForm = ref(false)
const editId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const query = reactive<PointsProductQuery>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: undefined,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '上架', value: 1 },
  { label: '下架', value: 0 },
]

const formData = reactive<PointsProductFormData>({
  name: '',
  description: '',
  image: '',
  pointsRequired: null,
  stock: null,
  sortOrder: 0,
})

const formRules: FormRules = {
  name: { required: true, message: '请输入商品名称', trigger: 'blur' },
  pointsRequired: { required: true, type: 'number', message: '请输入所需积分', trigger: 'blur' },
  stock: { required: true, type: 'number', message: '请输入库存', trigger: 'blur' },
}

function resetForm() {
  formData.name = ''
  formData.description = ''
  formData.image = ''
  formData.pointsRequired = null
  formData.stock = null
  formData.sortOrder = 0
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPointsProductPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载积分商品列表失败')
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
  resetForm()
  showForm.value = true
}

function handleEdit(row: PointsProductPageItem) {
  editId.value = row.id
  formData.name = row.name
  formData.description = row.description || ''
  formData.image = row.image || ''
  formData.pointsRequired = row.pointsRequired
  formData.stock = row.stock
  formData.sortOrder = row.sortOrder
  showForm.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    if (editId.value) {
      await updatePointsProduct(editId.value, formData)
      message.success('修改成功')
    } else {
      await createPointsProduct(formData)
      message.success('新增成功')
    }
    showForm.value = false
    loadData()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function handleToggleStatus(row: PointsProductPageItem) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  dialog.warning({
    title: '确认操作',
    content: `确定要${action}积分商品「${row.name}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updatePointsProductStatus(row.id, newStatus)
        message.success(`${action}成功`)
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : `${action}失败`)
      }
    },
  })
}

function handleDelete(row: PointsProductPageItem) {
  dialog.error({
    title: '确认删除',
    content: `确定要删除积分商品「${row.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deletePointsProduct(row.id)
        message.success('删除成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

const columns: DataTableColumns<PointsProductPageItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '名称', key: 'name', width: 150, ellipsis: { tooltip: true } },
  { title: '描述', key: 'description', width: 180, ellipsis: { tooltip: true },
    render: (row) => row.description || '-',
  },
  { title: '所需积分', key: 'pointsRequired', width: 90 },
  { title: '库存', key: 'stock', width: 70 },
  { title: '已兑换', key: 'exchangeCount', width: 80 },
  { title: '排序', key: 'sortOrder', width: 70 },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, { default: () => row.status === 1 ? '上架' : '下架' }),
  },
  { title: '创建时间', key: 'createTime', width: 170 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right',
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { text: true, type: 'primary', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { text: true, type: row.status === 1 ? 'warning' : 'success', onClick: () => handleToggleStatus(row) }, { default: () => row.status === 1 ? '下架' : '上架' }),
        h(NButton, { text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
      ],
    }),
  },
]

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

      <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="1200" :row-key="(row: PointsProductPageItem) => row.id" />

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

    <NModal v-model:show="showForm" preset="card" :title="editId ? '编辑积分商品' : '新增积分商品'" style="width: 520px" :mask-closable="false">
      <NForm ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="90">
        <NFormItem label="名称" path="name">
          <NInput v-model:value="formData.name" placeholder="请输入商品名称" />
        </NFormItem>
        <NFormItem label="所需积分" path="pointsRequired">
          <NInputNumber v-model:value="formData.pointsRequired" :min="1" placeholder="请输入所需积分" style="width: 100%" />
        </NFormItem>
        <NFormItem label="库存" path="stock">
          <NInputNumber v-model:value="formData.stock" :min="0" placeholder="请输入库存" style="width: 100%" />
        </NFormItem>
        <NFormItem label="图片URL" path="image">
          <NInput v-model:value="formData.image" placeholder="请输入图片URL" />
        </NFormItem>
        <NFormItem label="排序" path="sortOrder">
          <NInputNumber v-model:value="formData.sortOrder" :min="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="描述" path="description">
          <NInput v-model:value="formData.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="showForm = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSubmit">保存</NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>
