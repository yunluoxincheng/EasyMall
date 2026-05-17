<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NModal, NForm,
  NFormItem, NInputNumber, NDatePicker, useMessage, useDialog, NTabs, NTabPane, NStatistic, NSpin,
} from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import {
  getCouponPage, getCouponById, createCoupon, updateCoupon, updateCouponStatus, deleteCoupon,
  getUsageLogs, getCouponStatistics,
} from '@/api/coupon'
import type { CouponTemplateVO, CouponTemplateDTO, CouponQuery, CouponUsageLogVO, UsageLogQuery } from '@/types/coupon'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<CouponTemplateVO[]>([])
const total = ref(0)
const showForm = ref(false)
const editId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)
const saving = ref(false)
const activeTab = ref('list')

const query = reactive<CouponQuery>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  type: undefined,
  status: undefined,
})

const typeOptions = [
  { label: '全部类型', value: undefined },
  { label: '固定金额券', value: 1 },
  { label: '百分比折扣券', value: 2 },
  { label: '满减券', value: 3 },
  { label: '无门槛券', value: 4 },
]

const statusOptions = [
  { label: '全部状态', value: undefined },
  { label: '上架', value: 1 },
  { label: '下架', value: 0 },
]

const formData = reactive<CouponTemplateDTO>({
  name: '',
  type: null,
  discountAmount: null,
  discountPercentage: null,
  minAmount: null,
  maxDiscount: null,
  totalCount: null,
  memberLevel: 0,
  validDays: 0,
  startTime: '',
  endTime: '',
  sortOrder: 0,
  status: 0,
  description: '',
})

const formRules: FormRules = {
  name: { required: true, message: '请输入优惠券名称', trigger: 'blur' },
  type: { required: true, type: 'number', message: '请选择优惠券类型', trigger: 'change' },
  totalCount: { required: true, type: 'number', message: '请输入发行数量', trigger: 'blur' },
}

const formDataRange = ref<[number, number] | null>(null)

function resetForm() {
  formData.name = ''
  formData.type = null
  formData.discountAmount = null
  formData.discountPercentage = null
  formData.minAmount = null
  formData.maxDiscount = null
  formData.totalCount = null
  formData.memberLevel = 0
  formData.validDays = 0
  formData.startTime = ''
  formData.endTime = ''
  formData.sortOrder = 0
  formData.status = 0
  formData.description = ''
  formDataRange.value = null
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCouponPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载优惠券列表失败')
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

async function handleEdit(row: CouponTemplateVO) {
  editId.value = row.id
  try {
    const res = await getCouponById(row.id)
    const d = res.data.data
    formData.name = d.name
    formData.type = d.type
    formData.discountAmount = d.discountAmount
    formData.discountPercentage = d.discountPercentage
    formData.minAmount = d.minAmount
    formData.maxDiscount = d.maxDiscount
    formData.totalCount = d.totalCount
    formData.memberLevel = d.memberLevel
    formData.validDays = d.validDays
    formData.startTime = d.startTime || ''
    formData.endTime = d.endTime || ''
    formData.sortOrder = d.sortOrder
    formData.status = d.status
    formData.description = d.description || ''
    if (d.startTime && d.endTime) {
      formDataRange.value = [new Date(d.startTime).getTime(), new Date(d.endTime).getTime()]
    }
    showForm.value = true
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载优惠券信息失败')
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (formDataRange.value) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const formatLocal = (ts: number) => {
      const d = new Date(ts)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
    formData.startTime = formatLocal(formDataRange.value[0])
    formData.endTime = formatLocal(formDataRange.value[1])
  }

  saving.value = true
  try {
    if (editId.value) {
      const payload = { ...formData, id: editId.value }
      await updateCoupon(payload)
      message.success('修改成功')
    } else {
      await createCoupon(formData)
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

function handleToggleStatus(row: CouponTemplateVO) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  dialog.warning({
    title: '确认操作',
    content: `确定要${action}优惠券「${row.name}」吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateCouponStatus(row.id, newStatus)
        message.success(`${action}成功`)
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : `${action}失败`)
      }
    },
  })
}

function handleDelete(row: CouponTemplateVO) {
  dialog.error({
    title: '确认删除',
    content: `确定要删除优惠券「${row.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteCoupon(row.id)
        message.success('删除成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

const columns: DataTableColumns<CouponTemplateVO> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '名称', key: 'name', width: 150, ellipsis: { tooltip: true } },
  { title: '类型', key: 'typeDesc', width: 100 },
  { title: '优惠', key: 'discount', width: 120,
    render: (row) => {
      if (row.type === 1 || row.type === 3) return `¥${row.discountAmount}`
      if (row.type === 2) return `${row.discountPercentage}折`
      if (row.type === 4) return `¥${row.discountAmount}`
      return '-'
    },
  },
  { title: '门槛', key: 'minAmount', width: 90,
    render: (row) => row.minAmount > 0 ? `满${row.minAmount}` : '无门槛',
  },
  { title: '发行/剩余', key: 'stock', width: 110,
    render: (row) => `${row.remainingCount}/${row.totalCount}`,
  },
  { title: '已领/已用', key: 'usage', width: 110,
    render: (row) => `${row.receivedCount}/${row.usedCount}`,
  },
  { title: '领取率', key: 'receiveRate', width: 80,
    render: (row) => `${(row.receiveRate * 100).toFixed(1)}%`,
  },
  { title: '状态', key: 'status', width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, { default: () => row.statusDesc }),
  },
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

// Usage logs tab
const logLoading = ref(false)
const logData = ref<CouponUsageLogVO[]>([])
const logTotal = ref(0)
const logQuery = reactive<UsageLogQuery>({ pageNum: 1, pageSize: 10 })
const logFilterTemplateId = ref<number | undefined>(undefined)
const logFilterUserId = ref<number | undefined>(undefined)

async function loadLogs() {
  logLoading.value = true
  logQuery.templateId = logFilterTemplateId.value
  logQuery.userId = logFilterUserId.value
  try {
    const res = await getUsageLogs(logQuery)
    const page = res.data.data
    logData.value = page.records
    logTotal.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载使用记录失败')
  } finally {
    logLoading.value = false
  }
}

function handleLogSearch() {
  logQuery.pageNum = 1
  loadLogs()
}

function handleLogPageChange(page: number) {
  logQuery.pageNum = page
  loadLogs()
}

const logColumns: DataTableColumns<CouponUsageLogVO> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '用户ID', key: 'userId', width: 70 },
  { title: '优惠券', key: 'couponName', width: 130, ellipsis: { tooltip: true } },
  { title: '类型', key: 'couponTypeDesc', width: 100 },
  { title: '订单号', key: 'orderNo', width: 170 },
  { title: '订单金额', key: 'orderAmount', width: 90,
    render: (row) => `¥${row.orderAmount}`,
  },
  { title: '优惠金额', key: 'discountAmount', width: 90,
    render: (row) => `¥${row.discountAmount}`,
  },
  { title: '操作', key: 'actionDesc', width: 80 },
  { title: '时间', key: 'createTime', width: 170 },
]

// Statistics tab
const statsLoading = ref(false)
const stats = ref<Record<string, unknown>>({})

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await getCouponStatistics()
    stats.value = res.data.data
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

function handleTabChange(tab: string) {
  if (tab === 'logs' && logData.value.length === 0) loadLogs()
  if (tab === 'stats' && Object.keys(stats.value).length === 0) loadStats()
}

onMounted(loadData)
</script>

<template>
  <NCard>
    <NTabs v-model:value="activeTab" type="line" @update:value="handleTabChange">
      <NTabPane name="list" tab="优惠券模板">
        <NSpace justify="space-between" align="center" style="margin: 16px 0">
          <NSpace>
            <NInput v-model:value="query.name" placeholder="搜索名称" clearable style="width: 160px" @keyup.enter="handleSearch" />
            <NSelect v-model:value="query.type" :options="typeOptions" placeholder="类型" clearable style="width: 130px" />
            <NSelect v-model:value="query.status" :options="statusOptions" placeholder="状态" clearable style="width: 120px" />
            <NButton type="primary" @click="handleSearch">搜索</NButton>
          </NSpace>
          <NButton type="primary" @click="handleAdd">
            <template #icon><component :is="AddOutline" /></template>
            新增优惠券
          </NButton>
        </NSpace>

        <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="1300" :row-key="(row: CouponTemplateVO) => row.id" />

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
      </NTabPane>

      <NTabPane name="logs" tab="使用记录">
        <NSpace style="margin: 16px 0">
          <NInputNumber v-model:value="logFilterTemplateId" placeholder="模板ID" clearable style="width: 120px" />
          <NInputNumber v-model:value="logFilterUserId" placeholder="用户ID" clearable style="width: 120px" />
          <NButton type="primary" @click="handleLogSearch">搜索</NButton>
        </NSpace>
        <NDataTable :columns="logColumns" :data="logData" :loading="logLoading" :scroll-x="1100" :row-key="(row: CouponUsageLogVO) => row.id" />
        <NSpace justify="end" style="margin-top: 16px">
          <NPagination :page="logQuery.pageNum" :page-size="logQuery.pageSize" :item-count="logTotal" @update:page="handleLogPageChange" />
        </NSpace>
      </NTabPane>

      <NTabPane name="stats" tab="统计概览">
        <NSpin :show="statsLoading">
          <NSpace v-if="stats" style="margin-top: 16px" :size="24">
            <NStatistic label="总模板数" :value="(stats.totalTemplates as string | number) ?? '-'" />
            <NStatistic label="已上架" :value="(stats.activeTemplates as string | number) ?? '-'" />
            <NStatistic label="总领取数" :value="(stats.totalReceived as string | number) ?? '-'" />
            <NStatistic label="总使用数" :value="(stats.totalUsed as string | number) ?? '-'" />
          </NSpace>
        </NSpin>
      </NTabPane>
    </NTabs>
  </NCard>

  <NModal v-model:show="showForm" preset="card" :title="editId ? '编辑优惠券' : '新增优惠券'" style="width: 640px" :mask-closable="false">
    <NForm ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="100">
      <NFormItem label="名称" path="name">
        <NInput v-model:value="formData.name" placeholder="请输入优惠券名称" />
      </NFormItem>
      <NFormItem label="类型" path="type">
        <NSelect v-model:value="formData.type" :options="typeOptions.filter(o => o.value !== undefined)" placeholder="请选择类型" />
      </NFormItem>
      <NFormItem v-if="formData.type === 1 || formData.type === 3 || formData.type === 4" label="优惠金额">
        <NInputNumber v-model:value="formData.discountAmount" :min="0" :precision="2" placeholder="请输入优惠金额" style="width: 100%" />
      </NFormItem>
      <NFormItem v-if="formData.type === 2" label="折扣比例">
        <NInputNumber v-model:value="formData.discountPercentage" :min="1" :max="99" :precision="0" placeholder="如85表示85折" style="width: 100%" />
      </NFormItem>
      <NFormItem v-if="formData.type === 2" label="最大优惠">
        <NInputNumber v-model:value="formData.maxDiscount" :min="0" :precision="2" placeholder="0表示无限制" style="width: 100%" />
      </NFormItem>
      <NFormItem v-if="formData.type === 3" label="使用门槛">
        <NInputNumber v-model:value="formData.minAmount" :min="0" :precision="2" placeholder="最低消费金额" style="width: 100%" />
      </NFormItem>
      <NFormItem label="发行数量" path="totalCount">
        <NInputNumber v-model:value="formData.totalCount" :min="1" placeholder="请输入发行数量" style="width: 100%" />
      </NFormItem>
      <NFormItem label="会员等级限制">
        <NSelect v-model:value="formData.memberLevel" :options="[{ label: '不限制', value: 0 }, { label: '等级1', value: 1 }, { label: '等级2', value: 2 }, { label: '等级3', value: 3 }, { label: '等级4', value: 4 }, { label: '等级5', value: 5 }]" />
      </NFormItem>
      <NFormItem label="有效天数">
        <NInputNumber v-model:value="formData.validDays" :min="0" placeholder="0表示使用固定时间" style="width: 100%" />
      </NFormItem>
      <NFormItem v-if="formData.validDays === 0" label="有效期">
        <NDatePicker v-model:value="formDataRange" type="datetimerange" clearable style="width: 100%" />
      </NFormItem>
      <NFormItem label="排序">
        <NInputNumber v-model:value="formData.sortOrder" :min="0" style="width: 100%" />
      </NFormItem>
      <NFormItem label="状态">
        <NSelect v-model:value="formData.status" :options="[{ label: '上架', value: 1 }, { label: '下架', value: 0 }]" />
      </NFormItem>
      <NFormItem label="使用说明">
        <NInput v-model:value="formData.description" type="textarea" :rows="2" placeholder="请输入使用说明" />
      </NFormItem>
      <NSpace justify="end">
        <NButton @click="showForm = false">取消</NButton>
        <NButton type="primary" :loading="saving" @click="handleSubmit">保存</NButton>
      </NSpace>
    </NForm>
  </NModal>
</template>
