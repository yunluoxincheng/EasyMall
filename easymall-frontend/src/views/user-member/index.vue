<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NSpin,
  NProgress,
  NEmpty,
} from 'naive-ui'
import { getMemberLevels, getCurrentLevel } from '@/api/user-member'
import type { MemberLevelVO } from '@/types/member'

const message = useMessage()

const loading = ref(true)
const currentLevel = ref<MemberLevelVO | null>(null)
const levels = ref<MemberLevelVO[]>([])

onMounted(async () => {
  try {
    const [levelRes, levelsRes] = await Promise.all([
      getCurrentLevel(),
      getMemberLevels(),
    ])
    currentLevel.value = levelRes.data.data
    levels.value = levelsRes.data.data
  } catch {
    message.error('获取会员信息失败')
  } finally {
    loading.value = false
  }
})

function getProgressPercent() {
  if (!currentLevel.value) return 0
  const cl = currentLevel.value
  if (cl.pointsToNextLevel <= 0) return 100
  const range = cl.maxPoints - cl.minPoints
  if (range <= 0) return 100
  const current = cl.currentPoints - cl.minPoints
  return Math.min(100, Math.round((current / range) * 100))
}

function getLevelRange(item: MemberLevelVO) {
  if (item.maxPoints > 99999) {
    return `${item.minPoints}+ 积分`
  }
  return `${item.minPoints} ~ ${item.maxPoints} 积分`
}
</script>

<template>
  <NSpin :show="loading">
    <div class="member-page">
      <!-- 当前等级卡片 -->
      <NCard class="current-level-card" v-if="currentLevel">
        <div class="level-header">
          <div class="level-icon">{{ currentLevel.icon || `Lv.${currentLevel.level}` }}</div>
          <div class="level-info">
            <div class="level-name">{{ currentLevel.levelName }}</div>
            <div class="level-discount">
              享受 {{ currentLevel.discount }} 折优惠
            </div>
          </div>
        </div>
        <NDescriptions label-placement="left" :column="2" bordered style="margin-top: 16px">
          <NDescriptionsItem label="当前等级">Lv.{{ currentLevel.level }}</NDescriptionsItem>
          <NDescriptionsItem label="折扣率">{{ currentLevel.discount }} 折</NDescriptionsItem>
          <NDescriptionsItem label="当前积分">{{ currentLevel.currentPoints }}</NDescriptionsItem>
          <NDescriptionsItem label="距下一等级">
            {{ currentLevel.pointsToNextLevel > 0 ? `还需 ${currentLevel.pointsToNextLevel} 积分` : '已满级' }}
          </NDescriptionsItem>
        </NDescriptions>
        <div class="progress-section" v-if="currentLevel.pointsToNextLevel > 0">
          <span class="progress-label">升级进度</span>
          <NProgress
            type="line"
            :percentage="getProgressPercent()"
            :show-indicator="true"
            status="info"
            style="margin-top: 8px"
          />
        </div>
      </NCard>

      <!-- 等级体系列表 -->
      <h2 class="section-title">等级体系</h2>

      <NEmpty v-if="!loading && levels.length === 0" description="暂无等级数据" />

      <div class="level-list">
        <NCard
          v-for="item in levels"
          :key="item.level"
          class="level-card"
          :class="{ active: item.isCurrentLevel }"
        >
          <div class="level-card-header">
            <span class="level-card-icon">{{ item.icon || `Lv.${item.level}` }}</span>
            <NTag v-if="item.isCurrentLevel" type="success" size="small">当前</NTag>
          </div>
          <div class="level-card-name">{{ item.levelName }}</div>
          <div class="level-card-range">{{ getLevelRange(item) }}</div>
          <div class="level-card-discount">{{ item.discount }} 折</div>
          <div class="level-card-benefits" v-if="item.benefits">
            {{ item.benefits }}
          </div>
        </NCard>
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
.member-page {
  max-width: 700px;
  margin: 0 auto;
}

.current-level-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.level-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.level-info {
  color: #fff;
}

.level-name {
  font-size: 22px;
  font-weight: 700;
}

.level-discount {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
}

.progress-section {
  margin-top: 16px;
  color: #fff;
}

.progress-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-card {
  transition: all 0.2s;
  border: 2px solid transparent;
}

.level-card.active {
  border-color: #667eea;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
  background: #f8f8ff;
}

.level-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.level-card-icon {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.level-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.level-card-range {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.level-card-discount {
  font-size: 14px;
  font-weight: 600;
  color: #e4393c;
  margin-bottom: 4px;
}

.level-card-benefits {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}
</style>
