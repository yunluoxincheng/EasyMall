<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import {
  NList,
  NListItem,
  NRate,
  NButton,
  NEmpty,
  NSpin,
  NPagination,
  NTag,
  NImage,
  NSpace,
} from 'naive-ui'
import { getMyComments, deleteComment } from '@/api/user-comment'
import type { UserCommentVO } from '@/types/comment'

const message = useMessage()
const dialog = useDialog()

const loading = ref(true)
const comments = ref<UserCommentVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

async function loadData() {
  loading.value = true
  try {
    const res = await getMyComments({ pageNum: currentPage.value, pageSize: pageSize.value })
    comments.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    message.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function handlePageChange(page: number) {
  currentPage.value = page
  loadData()
}

function handleDelete(comment: UserCommentVO) {
  dialog.warning({
    title: '删除评论',
    content: '确定删除该条评论吗？删除后不可恢复。',
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteComment(comment.id)
        message.success('删除成功')
        loadData()
      } catch {
        message.error('删除失败')
      }
    },
  })
}

function formatTime(time: string) {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 19)
}
</script>

<template>
  <NSpin :show="loading">
    <div class="comments-page">
      <h2 class="page-title">我的评论</h2>

      <NEmpty v-if="!loading && comments.length === 0" description="暂无评论记录" />

      <NList v-if="comments.length" bordered>
        <NListItem v-for="item in comments" :key="item.id">
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-time">{{ formatTime(item.createTime) }}</span>
              <NRate :value="item.rating" readonly size="small" />
            </div>
            <div class="comment-content">{{ item.content }}</div>
            <NSpace class="comment-images" :size="8" v-if="item.images">
              <NImage
                v-for="(img, idx) in item.images.split(',')"
                :key="idx"
                :src="img"
                width="80"
                height="80"
                object-fit="cover"
                style="border-radius: 4px"
              />
            </NSpace>
            <div class="comment-reply" v-if="item.reply">
              <NTag size="small" type="info">商家回复</NTag>
              <span class="reply-text">{{ item.reply }}</span>
            </div>
            <div class="comment-actions">
              <NButton size="small" type="error" quaternary @click="handleDelete(item)">
                删除
              </NButton>
            </div>
          </div>
        </NListItem>
      </NList>

      <div class="pagination-wrap" v-if="total > pageSize">
        <NPagination
          v-model:page="currentPage"
          :page-size="pageSize"
          :item-count="total"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
.comments-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.comment-item {
  width: 100%;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-time {
  font-size: 13px;
  color: #999;
}

.comment-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-images {
  margin-bottom: 8px;
}

.comment-reply {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f9f9f9;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.reply-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
