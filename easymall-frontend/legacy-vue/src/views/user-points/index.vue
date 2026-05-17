<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NList,
  NListItem,
  NEmpty,
  NSpin,
  NPagination,
  NTag,
} from 'naive-ui'
import { getPointsRecords } from '@/api/user-points'
import { getUserInfo } from '@/api/user-user'
import type { PointsRecordVO } from '@/types/points'

const message = useMessage()

const loading = ref(true)
const currentPoints = ref(0)
const records = ref<PointsRecordVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

async function loadData() {
  loading.value = true
  try {
    const res = await getPointsRecords({ pageNum: currentPage.value, pageSize: pageSize.value })
    records.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    message.error('获取积分记录失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const infoRes = await getUserInfo()
    currentPoints.value = infoRes.data.data.points
  } catch {
    // ignore
  }
  loadData()
})

function handlePageChange(page: number) {
  currentPage.value = page
  loadData()
}

function formatTime(time: string) {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 19)
}
</script>

<template>
  <NSpin :show="loading">
    <div class="points-page">
      <NCard class="points-summary">
        <div class="summary-content">
          <div class="summary-label">当前积分</div>
          <div class="summary-value">{{ currentPoints }}</div>
        </div>
      </NCard>

      <h2 class="section-title">积分记录</h2>

      <NEmpty v-if="!loading && records.length === 0" description="暂无积分记录" />

      <NList v-if="records.length" bordered>
        <NListItem v-for="item in records" :key="item.id">
          <div class="record-item">
            <div class="record-left">
              <div class="record-desc">{{ item.description }}</div>
              <div class="record-meta">
                <NTag size="small" :type="item.pointsChange > 0 ? 'success' : 'error'">
                  {{ item.typeDesc }}
                </NTag>
                <span class="record-time">{{ formatTime(item.createTime) }}</span>
              </div>
            </div>
            <div class="record-right">
              <span class="points-change" :class="{ positive: item.pointsChange > 0, negative: item.pointsChange < 0 }">
                {{ item.pointsChange > 0 ? '+' : '' }}{{ item.pointsChange }}
              </span>
              <span class="points-after">余额: {{ item.afterPoints }}</span>
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
.points-page {
  max-width: 800px;
  margin: 0 auto;
}

.points-summary {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-content {
  text-align: center;
  padding: 16px 0;
}

.summary-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.record-left {
  flex: 1;
}

.record-desc {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-right {
  text-align: right;
  min-width: 100px;
}

.points-change {
  display: block;
  font-size: 18px;
  font-weight: 600;
}

.points-change.positive {
  color: #18a058;
}

.points-change.negative {
  color: #e4393c;
}

.points-after {
  font-size: 12px;
  color: #999;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
