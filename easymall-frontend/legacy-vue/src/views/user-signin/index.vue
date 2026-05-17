<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton, NCard, NStatistic, NSpin, useMessage } from 'naive-ui'
import { doSignIn, getSignInStatus } from '@/api/user-signin'
import type { SignInResultVO } from '@/types/member'

const message = useMessage()
const loading = ref(true)
const signing = ref(false)
const signInInfo = ref<SignInResultVO | null>(null)

async function fetchStatus() {
  try {
    const res = await getSignInStatus()
    signInInfo.value = res.data.data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function handleSignIn() {
  signing.value = true
  try {
    const res = await doSignIn()
    signInInfo.value = res.data.data
    if (signInInfo.value.success) {
      message.success(`签到成功，获得 ${signInInfo.value.pointsEarned} 积分`)
    } else {
      message.info(signInInfo.value.message || '今日已签到')
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '签到失败'
    message.error(msg)
  } finally {
    signing.value = false
  }
}

onMounted(() => fetchStatus())
</script>

<template>
  <NSpin :show="loading">
    <div class="signin-page">
      <NCard title="每日签到" class="signin-card">
        <div class="signin-body">
          <NStatistic label="当前积分" :value="signInInfo?.currentPoints ?? 0" />
          <NStatistic label="连续签到天数" :value="signInInfo?.continuousDays ?? 0" />

          <NButton
            type="primary"
            size="large"
            :loading="signing"
            :disabled="signInInfo?.hasSignedToday"
            @click="handleSignIn"
          >
            {{ signInInfo?.hasSignedToday ? '今日已签到' : '立即签到' }}
          </NButton>

          <p v-if="signInInfo?.hasSignedToday" class="signed-tip">
            今日已签到，明天再来吧
          </p>
        </div>
      </NCard>
    </div>
  </NSpin>
</template>

<style scoped>
.signin-page {
  max-width: 500px;
  margin: 0 auto;
}

.signin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px 0;
}

.signed-tip {
  font-size: 13px;
  color: #999;
  margin: 0;
}
</style>
