<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NDrawer, NDrawerContent,
  NDescriptions, NDescriptionsItem, NModal, NForm, NFormItem, NInputNumber, useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { getUserPage, getUserById, updateUserStatus, updateUserRole, updateUserPoints } from '@/api/user'
import type { UserPageItem, UserQuery, UserDetail } from '@/types/user'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<UserPageItem[]>([])
const total = ref(0)
const showDetail = ref(false)
const detailLoading = ref(false)
const detail = ref<UserDetail | null>(null)
const showPointsModal = ref(false)
const pointsFormRef = ref<FormInst | null>(null)
const pointsSaving = ref(false)
const pointsTarget = ref<UserPageItem | null>(null)
const pointsValue = ref<number | null>(null)

const query = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: '',
  status: undefined,
  role: undefined,
})

const statusOptions = [
  { label: '全部状态', value: undefined },
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 },
]

const roleOptions = [
  { label: '全部角色', value: undefined },
  { label: '普通用户', value: 0 },
  { label: '管理员', value: 1 },
]

const pointsRules: FormRules = {
  points: { required: true, type: 'number', message: '请输入积分调整值', trigger: 'blur' },
}

async function loadData() {
  loading.value = true
  try {
    const res = await getUserPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载用户列表失败')
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

async function handleViewDetail(row: UserPageItem) {
  showDetail.value = true
  detailLoading.value = true
  try {
    const res = await getUserById(row.id)
    detail.value = res.data.data
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载用户详情失败')
  } finally {
    detailLoading.value = false
  }
}

function handleToggleStatus(row: UserPageItem) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  dialog.warning({
    title: '确认操作',
    content: `确定要${action}用户「${row.username}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateUserStatus(row.id, newStatus)
        message.success(`${action}成功`)
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : `${action}失败`)
      }
    },
  })
}

function handleToggleRole(row: UserPageItem) {
  const newRole = row.role === 1 ? 0 : 1
  const action = newRole === 1 ? '设为管理员' : '设为普通用户'
  dialog.warning({
    title: '确认操作',
    content: `确定要将用户「${row.username}」${action}吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateUserRole(row.id, newRole)
        message.success('角色修改成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '角色修改失败')
      }
    },
  })
}

function openPointsModal(row: UserPageItem) {
  pointsTarget.value = row
  pointsValue.value = null
  showPointsModal.value = true
}

async function handlePointsSubmit() {
  try {
    await pointsFormRef.value?.validate()
  } catch {
    return
  }
  if (!pointsTarget.value || pointsValue.value === null) return

  pointsSaving.value = true
  try {
    await updateUserPoints(pointsTarget.value.id, pointsValue.value)
    message.success('积分调整成功')
    showPointsModal.value = false
    loadData()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '积分调整失败')
  } finally {
    pointsSaving.value = false
  }
}

const genderMap: Record<number, string> = { 0: '女', 1: '男' }

const columns: DataTableColumns<UserPageItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '性别', key: 'gender', width: 60,
    render: (row) => genderMap[row.gender] ?? '未知',
  },
  { title: '角色', key: 'role', width: 90,
    render: (row) => h(NTag, { type: row.role === 1 ? 'warning' : 'default', size: 'small' }, { default: () => row.role === 1 ? '管理员' : '用户' }),
  },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'error', size: 'small' }, { default: () => row.status === 1 ? '正常' : '禁用' }),
  },
  { title: '积分', key: 'points', width: 80 },
  { title: '等级', key: 'level', width: 60 },
  { title: '注册时间', key: 'createTime', width: 170 },
  { title: '操作', key: 'actions', width: 280, fixed: 'right',
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { text: true, type: 'primary', onClick: () => handleViewDetail(row) }, { default: () => '详情' }),
        h(NButton, { text: true, type: row.status === 1 ? 'warning' : 'success', onClick: () => handleToggleStatus(row) }, { default: () => row.status === 1 ? '禁用' : '启用' }),
        h(NButton, { text: true, type: 'info', onClick: () => handleToggleRole(row) }, { default: () => row.role === 1 ? '降为用户' : '升为管理员' }),
        h(NButton, { text: true, type: 'success', onClick: () => openPointsModal(row) }, { default: () => '调整积分' }),
      ],
    }),
  },
]

onMounted(loadData)
</script>

<template>
  <div>
    <NCard>
      <NSpace style="margin-bottom: 16px">
        <NInput v-model:value="query.username" placeholder="搜索用户名" clearable style="width: 160px" @keyup.enter="handleSearch" />
        <NInput v-model:value="query.phone" placeholder="手机号" clearable style="width: 160px" @keyup.enter="handleSearch" />
        <NSelect v-model:value="query.status" :options="statusOptions" placeholder="状态" clearable style="width: 120px" />
        <NSelect v-model:value="query.role" :options="roleOptions" placeholder="角色" clearable style="width: 130px" />
        <NButton type="primary" @click="handleSearch">搜索</NButton>
      </NSpace>

      <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="1300" :row-key="(row: UserPageItem) => row.id" />

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

    <NDrawer v-model:show="showDetail" :width="500" placement="right">
      <NDrawerContent title="用户详情" :native-scrollbar="false">
        <template v-if="detailLoading">加载中...</template>
        <template v-else-if="detail">
          <NDescriptions bordered :column="2" label-style="width: 80px">
            <NDescriptionsItem label="用户名">{{ detail.username }}</NDescriptionsItem>
            <NDescriptionsItem label="昵称">{{ detail.nickname || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="手机号">{{ detail.phone || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="邮箱">{{ detail.email || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="性别">{{ genderMap[detail.gender] ?? '未知' }}</NDescriptionsItem>
            <NDescriptionsItem label="角色">
              <NTag :type="detail.role === 1 ? 'warning' : 'default'" size="small">{{ detail.role === 1 ? '管理员' : '用户' }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="状态">
              <NTag :type="detail.status === 1 ? 'success' : 'error'" size="small">{{ detail.status === 1 ? '正常' : '禁用' }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="积分">{{ detail.points }}</NDescriptionsItem>
            <NDescriptionsItem label="会员等级">{{ detail.level }}</NDescriptionsItem>
            <NDescriptionsItem label="注册时间">{{ detail.createTime }}</NDescriptionsItem>
            <NDescriptionsItem label="更新时间">{{ detail.updateTime }}</NDescriptionsItem>
          </NDescriptions>
        </template>
      </NDrawerContent>
    </NDrawer>

    <NModal v-model:show="showPointsModal" preset="card" title="调整积分" style="width: 400px" :mask-closable="false">
      <NForm ref="pointsFormRef" :model="{ points: pointsValue }" :rules="pointsRules" label-placement="left" label-width="80">
        <NFormItem label="用户">
          <span>{{ pointsTarget?.username }}（当前积分：{{ pointsTarget?.points }}）</span>
        </NFormItem>
        <NFormItem label="调整值" path="points">
          <NInputNumber v-model:value="pointsValue" placeholder="正数增加，负数扣减" style="width: 100%" />
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="showPointsModal = false">取消</NButton>
          <NButton type="primary" :loading="pointsSaving" @click="handlePointsSubmit">确认</NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>
