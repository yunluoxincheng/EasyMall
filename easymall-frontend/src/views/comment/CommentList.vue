<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NSpace, NInput, NSelect, NButton, NDataTable, NPagination, NTag, NModal, NInputNumber, useMessage, useDialog,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getCommentPage, approveComment, rejectComment, replyComment, deleteComment } from '@/api/comment'
import type { CommentPageItem, CommentQuery } from '@/types/comment'

const message = useMessage()
const dialog = useDialog()
const loading = ref(false)
const data = ref<CommentPageItem[]>([])
const total = ref(0)
const showReplyModal = ref(false)
const replyTarget = ref<CommentPageItem | null>(null)
const replyContent = ref('')
const replySaving = ref(false)

const query = reactive<CommentQuery>({
  pageNum: 1,
  pageSize: 10,
  showStatus: undefined,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getCommentPage(query)
    const page = res.data.data
    data.value = page.records
    total.value = page.total
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载评论列表失败')
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

function handleApprove(row: CommentPageItem) {
  dialog.success({
    title: '审核通过',
    content: `确定通过该评论吗？`,
    positiveText: '通过',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await approveComment(row.id)
        message.success('审核通过')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '操作失败')
      }
    },
  })
}

function handleReject(row: CommentPageItem) {
  dialog.warning({
    title: '审核拒绝',
    content: `确定拒绝该评论吗？`,
    positiveText: '拒绝',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await rejectComment(row.id)
        message.success('已拒绝')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '操作失败')
      }
    },
  })
}

function openReplyModal(row: CommentPageItem) {
  replyTarget.value = row
  replyContent.value = row.reply || ''
  showReplyModal.value = true
}

async function handleReplySubmit() {
  if (!replyContent.value.trim()) {
    message.warning('请输入回复内容')
    return
  }
  if (!replyTarget.value) return

  replySaving.value = true
  try {
    await replyComment(replyTarget.value.id, replyContent.value.trim())
    message.success('回复成功')
    showReplyModal.value = false
    loadData()
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '回复失败')
  } finally {
    replySaving.value = false
  }
}

function handleDelete(row: CommentPageItem) {
  dialog.error({
    title: '确认删除',
    content: '确定要删除该评论吗？此操作不可恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteComment(row.id)
        message.success('删除成功')
        loadData()
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '删除失败')
      }
    },
  })
}

const columns: DataTableColumns<CommentPageItem> = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '用户', key: 'nickname', width: 100,
    render: (row) => row.nickname || row.username,
  },
  { title: '商品', key: 'productName', width: 140, ellipsis: { tooltip: true } },
  { title: '评论内容', key: 'content', width: 200, ellipsis: { tooltip: true } },
  { title: '评分', key: 'rating', width: 60 },
  { title: '状态', key: 'showStatus', width: 80,
    render: (row) => h(NTag, { type: row.showStatus === 1 ? 'success' : 'warning', size: 'small' }, { default: () => row.showStatus === 1 ? '已通过' : '待审核' }),
  },
  { title: '商家回复', key: 'reply', width: 150, ellipsis: { tooltip: true },
    render: (row) => row.reply || '-',
  },
  { title: '时间', key: 'createTime', width: 170 },
  { title: '操作', key: 'actions', width: 280, fixed: 'right',
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        row.showStatus !== 1
          ? h(NButton, { text: true, type: 'success', onClick: () => handleApprove(row) }, { default: () => '通过' })
          : h(NButton, { text: true, type: 'warning', onClick: () => handleReject(row) }, { default: () => '拒绝' }),
        h(NButton, { text: true, type: 'primary', onClick: () => openReplyModal(row) }, { default: () => '回复' }),
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
      <NSpace style="margin-bottom: 16px">
        <NSelect v-model:value="query.showStatus" :options="statusOptions" placeholder="审核状态" clearable style="width: 120px" />
        <NInputNumber v-model:value="query.productId" placeholder="商品ID" clearable style="width: 120px" />
        <NInputNumber v-model:value="query.userId" placeholder="用户ID" clearable style="width: 120px" />
        <NButton type="primary" @click="handleSearch">搜索</NButton>
      </NSpace>

      <NDataTable :columns="columns" :data="data" :loading="loading" :scroll-x="1200" :row-key="(row: CommentPageItem) => row.id" />

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

    <NModal v-model:show="showReplyModal" preset="card" title="回复评论" style="width: 500px" :mask-closable="false">
      <p style="margin-bottom: 8px; color: #666">原评论：{{ replyTarget?.content }}</p>
      <NInput v-model:value="replyContent" type="textarea" :rows="4" placeholder="请输入回复内容" />
      <NSpace justify="end" style="margin-top: 12px">
        <NButton @click="showReplyModal = false">取消</NButton>
        <NButton type="primary" :loading="replySaving" @click="handleReplySubmit">提交回复</NButton>
      </NSpace>
    </NModal>
  </div>
</template>
