<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NModal, NForm,
  NFormItem, NInputNumber, useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { getCategoryPage, createCategory, updateCategory, deleteCategory, updateCategoryStatus } from '@/api/category'
import type { CategoryPageItem, CategoryQuery, CategoryFormData } from '@/types/category'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<CategoryPageItem[]>([])
const total = ref(0)
const showForm = ref(false)
const editId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const query = reactive<CategoryQuery>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: undefined,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

const formData = reactive<CategoryFormData>({
  name: '',
  icon: '',
  parentId: null,
  level: 1,
  sort: 0,
  status: 1,
})

const formRules: FormRules = {
  name: { required: true, message: '请输入分类名称', trigger: 'blur' },
  level: { required: true, type: 'number', message: '请输入级别', trigger: 'blur' },
  status: { required: true, type: 'number', message: '请选择状态', trigger: 'change' },
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCategoryPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载分类列表失败')
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

function resetForm() {
  formData.name = ''
  formData.icon = ''
  formData.parentId = null
  formData.level = 1
  formData.sort = 0
  formData.status = 1
}

function handleAdd() {
  editId.value = null
  resetForm()
  showForm.value = true
}

function handleEdit(row: CategoryPageItem) {
  editId.value = row.id
  formData.name = row.name
  formData.icon = row.icon || ''
  formData.parentId = row.parentId || null
  formData.level = row.level
  formData.sort = row.sort
  formData.status = row.status
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
      await updateCategory(editId.value, formData)
      message.success('修改成功')
    } else {
      await createCategory(formData)
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

function handleToggleStatus(row: CategoryPageItem) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  dialog.warning({
    title: '确认操作',
    content: `确定要${action}分类「${row.name}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateCategoryStatus(row.id, newStatus)
        message.success(`${action}成功`)
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : `${action}失败`)
      }
    },
  })
}

function handleDelete(row: CategoryPageItem) {
  dialog.error({
    title: '确认删除',
    content: `确定要删除分类「${row.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteCategory(row.id)
        message.success('删除成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

const columns: DataTableColumns<CategoryPageItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '分类名称', key: 'name', width: 150 },
  { title: '父分类', key: 'parentName', width: 120,
    render: (row) => row.parentName || '-',
  },
  { title: '级别', key: 'level', width: 70 },
  { title: '排序', key: 'sort', width: 70 },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, { default: () => row.status === 1 ? '启用' : '禁用' }),
  },
  { title: '操作', key: 'actions', width: 200, fixed: 'right',
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { text: true, type: 'primary', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { text: true, type: row.status === 1 ? 'warning' : 'success', onClick: () => handleToggleStatus(row) }, { default: () => row.status === 1 ? '禁用' : '启用' }),
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
          <NInput v-model:value="query.name" placeholder="搜索分类名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
          <NSelect v-model:value="query.status" :options="statusOptions" placeholder="状态" clearable style="width: 120px" />
          <NButton type="primary" @click="handleSearch">搜索</NButton>
        </NSpace>
        <NButton type="primary" @click="handleAdd">
          <template #icon><component :is="AddOutline" /></template>
          新增分类
        </NButton>
      </NSpace>

      <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="800" :row-key="(row: CategoryPageItem) => row.id" />

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

    <NModal v-model:show="showForm" preset="card" :title="editId ? '编辑分类' : '新增分类'" style="width: 500px" :mask-closable="false">
      <NForm ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="80">
        <NFormItem label="名称" path="name">
          <NInput v-model:value="formData.name" placeholder="请输入分类名称" />
        </NFormItem>
        <NFormItem label="图标" path="icon">
          <NInput v-model:value="formData.icon" placeholder="请输入图标URL" />
        </NFormItem>
        <NFormItem label="父分类ID" path="parentId">
          <NInputNumber v-model:value="formData.parentId" placeholder="无父分类则留空" style="width: 100%" />
        </NFormItem>
        <NFormItem label="级别" path="level">
          <NInputNumber v-model:value="formData.level" :min="1" placeholder="请输入级别" style="width: 100%" />
        </NFormItem>
        <NFormItem label="排序" path="sort">
          <NInputNumber v-model:value="formData.sort" :min="0" placeholder="请输入排序值" style="width: 100%" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect v-model:value="formData.status" :options="[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]" />
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="showForm = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSubmit">保存</NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>
