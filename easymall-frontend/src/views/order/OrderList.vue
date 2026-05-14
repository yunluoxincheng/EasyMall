<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NDrawer, NDrawerContent,
  NDescriptions, NDescriptionsItem, NImage, useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getOrderPage, getOrderById, updateOrderStatus, cancelOrder } from '@/api/order'
import type { OrderPageItem, OrderQuery, OrderDetail } from '@/types/order'
import { OrderStatus, orderStatusMap } from '@/types/order'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<OrderPageItem[]>([])
const total = ref(0)
const showDetail = ref(false)
const detailLoading = ref(false)
const detail = ref<OrderDetail | null>(null)

const statusOptions = [
  { label: '全部状态', value: undefined },
  { label: '待支付', value: OrderStatus.PENDING_PAYMENT },
  { label: '已支付', value: OrderStatus.PAID },
  { label: '待发货', value: OrderStatus.WAITING_SHIPMENT },
  { label: '已发货', value: OrderStatus.SHIPPED },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
  { label: '退款中', value: OrderStatus.REFUNDING },
  { label: '已退款', value: OrderStatus.REFUNDED },
]

const query = reactive<OrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  status: undefined,
})

function getStatusType(status: number): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const map: Record<number, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    [OrderStatus.PENDING_PAYMENT]: 'warning',
    [OrderStatus.PAID]: 'info',
    [OrderStatus.WAITING_SHIPMENT]: 'info',
    [OrderStatus.SHIPPED]: 'success',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'error',
    [OrderStatus.REFUNDING]: 'warning',
    [OrderStatus.REFUNDED]: 'default',
  }
  return map[status] ?? 'default'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载订单列表失败')
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

async function handleViewDetail(row: OrderPageItem) {
  showDetail.value = true
  detailLoading.value = true
  try {
    const res = await getOrderById(row.id)
    detail.value = res.data.data
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载订单详情失败')
  } finally {
    detailLoading.value = false
  }
}

function handleShip(row: OrderPageItem) {
  dialog.warning({
    title: '确认发货',
    content: `确定要将订单「${row.orderNo}」标记为已发货吗？`,
    positiveText: '确认发货',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updateOrderStatus(row.id, OrderStatus.SHIPPED)
        message.success('发货成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '发货失败')
      }
    },
  })
}

function handleCancel(row: OrderPageItem) {
  dialog.error({
    title: '确认取消',
    content: `确定要取消订单「${row.orderNo}」吗？此操作不可恢复。`,
    positiveText: '确认取消',
    negativeText: '返回',
    onPositiveClick: async () => {
      try {
        await cancelOrder(row.id)
        message.success('取消订单成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '取消订单失败')
      }
    },
  })
}

const columns: DataTableColumns<OrderPageItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '订单号', key: 'orderNo', width: 200, ellipsis: { tooltip: true } },
  { title: '用户', key: 'nickname', width: 100,
    render: (row) => row.nickname || row.username,
  },
  { title: '总金额', key: 'totalAmount', width: 100,
    render: (row) => `¥${row.totalAmount}`,
  },
  { title: '实付金额', key: 'payAmount', width: 100,
    render: (row) => `¥${row.payAmount}`,
  },
  { title: '状态', key: 'status', width: 90,
    render: (row) => h(NTag, { type: getStatusType(row.status), size: 'small' }, { default: () => orderStatusMap[row.status] ?? '未知' }),
  },
  { title: '支付方式', key: 'paymentMethod', width: 100,
    render: (row) => row.paymentMethod || '-',
  },
  { title: '创建时间', key: 'createTime', width: 170 },
  { title: '操作', key: 'actions', width: 220, fixed: 'right',
    render: (row) => {
      const actions = [
        h(NButton, { text: true, type: 'primary', onClick: () => handleViewDetail(row) }, { default: () => '详情' }),
      ]
      if (row.status === OrderStatus.WAITING_SHIPMENT) {
        actions.push(h(NButton, { text: true, type: 'success', onClick: () => handleShip(row) }, { default: () => '发货' }))
      }
      if (row.status === OrderStatus.PENDING_PAYMENT || row.status === OrderStatus.PAID || row.status === OrderStatus.WAITING_SHIPMENT) {
        actions.push(h(NButton, { text: true, type: 'error', onClick: () => handleCancel(row) }, { default: () => '取消' }))
      }
      return h(NSpace, { size: 'small' }, { default: () => actions })
    },
  },
]

onMounted(loadData)
</script>

<template>
  <div>
    <NCard>
      <NSpace style="margin-bottom: 16px">
        <NInput v-model:value="query.orderNo" placeholder="搜索订单号" clearable style="width: 220px" @keyup.enter="handleSearch" />
        <NSelect v-model:value="query.status" :options="statusOptions" placeholder="订单状态" clearable style="width: 140px" />
        <NButton type="primary" @click="handleSearch">搜索</NButton>
      </NSpace>

      <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="1200" :row-key="(row: OrderPageItem) => row.id" />

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

    <NDrawer v-model:show="showDetail" :width="640" placement="right">
      <NDrawerContent title="订单详情" :native-scrollbar="false">
        <template v-if="detailLoading">加载中...</template>
        <template v-else-if="detail">
          <NDescriptions bordered :column="2" label-style="width: 100px">
            <NDescriptionsItem label="订单号">{{ detail.orderNo }}</NDescriptionsItem>
            <NDescriptionsItem label="状态">
              <NTag :type="getStatusType(detail.status)" size="small">{{ orderStatusMap[detail.status] ?? '未知' }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="用户">{{ detail.nickname || detail.username }}</NDescriptionsItem>
            <NDescriptionsItem label="手机号">{{ detail.phone || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="总金额">¥{{ detail.totalAmount }}</NDescriptionsItem>
            <NDescriptionsItem label="实付金额">¥{{ detail.payAmount }}</NDescriptionsItem>
            <NDescriptionsItem label="支付方式">{{ detail.paymentMethod || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="支付时间">{{ detail.payTime || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="收货人">{{ detail.receiverName || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="收货电话">{{ detail.receiverPhone || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="收货地址" :span="2">{{ detail.receiverAddress || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="备注" :span="2">{{ detail.remark || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="创建时间" :span="2">{{ detail.createTime }}</NDescriptionsItem>
          </NDescriptions>

          <h4 style="margin: 16px 0 8px">订单明细</h4>
          <NDataTable
            :columns="[
              { title: '商品图片', key: 'productImage', width: 70,
                render: (row: OrderDetail['items'][0]) => row.productImage ? h(NImage, { src: row.productImage, width: 40, height: 40, objectFit: 'cover', style: { borderRadius: '4px' } }) : '-',
              },
              { title: '商品名称', key: 'productName' },
              { title: '单价', key: 'price', width: 90, render: (row: OrderDetail['items'][0]) => `¥${row.price}` },
              { title: '数量', key: 'quantity', width: 70 },
              { title: '小计', key: 'subtotal', width: 90, render: (row: OrderDetail['items'][0]) => `¥${row.subtotal}` },
            ]"
            :data="detail.items || []"
            :bordered="true"
            size="small"
            :row-key="(row: OrderDetail['items'][0]) => row.id"
          />
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
