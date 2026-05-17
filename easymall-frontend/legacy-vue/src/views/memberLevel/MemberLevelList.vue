<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NButton, NDataTable, NTag, NModal, NForm, NFormItem, NInputNumber, useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { getAllMemberLevels, createMemberLevel, updateMemberLevel, updateMemberLevelStatus, deleteMemberLevel } from '@/api/memberLevel'
import type { MemberLevelItem, MemberLevelFormData } from '@/types/memberLevel'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const allData = ref<MemberLevelItem[]>([])
const filteredData = ref<MemberLevelItem[]>([])
const searchText = ref('')
const showForm = ref(false)
const editId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const formData = reactive<MemberLevelFormData>({
  level: null,
  levelName: '',
  minPoints: null,
  maxPoints: null,
  discount: null,
  icon: '',
  benefits: '',
  sortOrder: 0,
})

const formRules: FormRules = {
  level: { required: true, type: 'number', message: '请输入等级', trigger: 'blur' },
  levelName: { required: true, message: '请输入等级名称', trigger: 'blur' },
  minPoints: { required: true, type: 'number', message: '请输入最小积分', trigger: 'blur' },
  maxPoints: { required: true, type: 'number', message: '请输入最大积分', trigger: 'blur' },
  discount: { required: true, type: 'number', message: '请输入折扣率', trigger: 'blur' },
}

async function loadData() {
  loading.value = true
  try {
    const res = await getAllMemberLevels()
    allData.value = res.data.data
    applyFilter()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载会员等级失败')
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  if (!searchText.value) {
    filteredData.value = allData.value
  } else {
    const kw = searchText.value.toLowerCase()
    filteredData.value = allData.value.filter(item => item.levelName.toLowerCase().includes(kw))
  }
}

function handleSearch() {
  applyFilter()
}

function resetForm() {
  formData.level = null
  formData.levelName = ''
  formData.minPoints = null
  formData.maxPoints = null
  formData.discount = null
  formData.icon = ''
  formData.benefits = ''
  formData.sortOrder = 0
}

function handleAdd() {
  editId.value = null
  resetForm()
  showForm.value = true
}

function handleEdit(row: MemberLevelItem) {
  editId.value = row.id
  formData.level = row.level
  formData.levelName = row.levelName
  formData.minPoints = row.minPoints
  formData.maxPoints = row.maxPoints
  formData.discount = row.discount
  formData.icon = row.icon || ''
  formData.benefits = row.benefits || ''
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
      await updateMemberLevel(editId.value, formData)
      message.success('修改成功')
    } else {
      await createMemberLevel(formData)
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

function handleToggleStatus(row: MemberLevelItem) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  dialog.warning({
    title: '确认操作',
    content: `确定要${action}等级「${row.levelName}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateMemberLevelStatus(row.id, newStatus)
        message.success(`${action}成功`)
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : `${action}失败`)
      }
    },
  })
}

function handleDelete(row: MemberLevelItem) {
  dialog.error({
    title: '确认删除',
    content: `确定要删除等级「${row.levelName}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteMemberLevel(row.id)
        message.success('删除成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

const columns: DataTableColumns<MemberLevelItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '等级', key: 'level', width: 60 },
  { title: '名称', key: 'levelName', width: 120 },
  { title: '积分范围', key: 'pointsRange', width: 150,
    render: (row) => `${row.minPoints} - ${row.maxPoints}`,
  },
  { title: '折扣率', key: 'discount', width: 80,
    render: (row) => `${(row.discount * 100).toFixed(0)}%`,
  },
  { title: '排序', key: 'sortOrder', width: 70 },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, { default: () => row.status === 1 ? '启用' : '禁用' }),
  },
  { title: '创建时间', key: 'createTime', width: 170 },
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
          <NInput v-model:value="searchText" placeholder="搜索等级名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
          <NButton type="primary" @click="handleSearch">搜索</NButton>
        </NSpace>
        <NButton type="primary" @click="handleAdd">
          <template #icon><component :is="AddOutline" /></template>
          新增等级
        </NButton>
      </NSpace>

      <NDataTable :columns="columns" :data="filteredData" :loading="loading" :scroll-x="1000" :row-key="(row: MemberLevelItem) => row.id" />
    </NCard>

    <NModal v-model:show="showForm" preset="card" :title="editId ? '编辑会员等级' : '新增会员等级'" style="width: 520px" :mask-closable="false">
      <NForm ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="100">
        <NFormItem label="等级" path="level">
          <NInputNumber v-model:value="formData.level" :min="1" placeholder="请输入等级" style="width: 100%" />
        </NFormItem>
        <NFormItem label="等级名称" path="levelName">
          <NInput v-model:value="formData.levelName" placeholder="请输入等级名称" />
        </NFormItem>
        <NFormItem label="最小积分" path="minPoints">
          <NInputNumber v-model:value="formData.minPoints" :min="0" placeholder="请输入最小积分" style="width: 100%" />
        </NFormItem>
        <NFormItem label="最大积分" path="maxPoints">
          <NInputNumber v-model:value="formData.maxPoints" :min="0" placeholder="请输入最大积分" style="width: 100%" />
        </NFormItem>
        <NFormItem label="折扣率" path="discount">
          <NInputNumber v-model:value="formData.discount" :min="0.01" :max="1" :step="0.05" :precision="2" placeholder="如0.85表示85折" style="width: 100%" />
        </NFormItem>
        <NFormItem label="图标URL" path="icon">
          <NInput v-model:value="formData.icon" placeholder="请输入图标URL" />
        </NFormItem>
        <NFormItem label="权益说明" path="benefits">
          <NInput v-model:value="formData.benefits" type="textarea" :rows="2" placeholder="请输入权益说明" />
        </NFormItem>
        <NFormItem label="排序" path="sortOrder">
          <NInputNumber v-model:value="formData.sortOrder" :min="0" style="width: 100%" />
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="showForm = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSubmit">保存</NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>
