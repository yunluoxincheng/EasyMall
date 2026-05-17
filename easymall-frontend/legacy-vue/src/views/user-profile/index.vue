<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDescriptions,
  NDescriptionsItem,
  NAvatar,
  NSpace,
  NSpin,
  NSelect,
  NTag,
  NIcon,
} from 'naive-ui'
import {
  BarChartOutline,
  ShieldCheckmarkOutline,
  StorefrontOutline,
} from '@vicons/ionicons5'
import { getUserInfo, updateUserInfo } from '@/api/user-user'
import { useAuthStore } from '@/stores/auth'
import { useUserAuthStore } from '@/stores/userAuth'
import type { UserVO, UserUpdateDTO } from '@/types/user-user'

const router = useRouter()
const message = useMessage()
const adminAuth = useAuthStore()
const userAuth = useUserAuthStore()
const loading = ref(true)
const saving = ref(false)
const userInfo = ref<UserVO | null>(null)
const isAdmin = computed(() => userInfo.value?.role === 1)

const editForm = ref<UserUpdateDTO>({
  nickname: '',
  phone: '',
  email: '',
  gender: undefined,
})

const genderOptions = [
  { label: '未设置', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]

onMounted(async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res.data.data
    editForm.value = {
      nickname: userInfo.value.nickname,
      phone: userInfo.value.phone,
      email: userInfo.value.email,
      gender: userInfo.value.gender,
    }
  } catch {
    message.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  try {
    await updateUserInfo(editForm.value)
    message.success('保存成功')
    const res = await getUserInfo()
    userInfo.value = res.data.data
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

function enterAdmin() {
  if (!userAuth.token || userAuth.userInfo?.role !== 1) {
    message.warning('当前账号不是管理员')
    return
  }
  adminAuth.setLogin(userAuth.token, 1)
  router.push('/admin')
}
</script>

<template>
  <NSpin :show="loading">
    <div class="user-profile">
      <section v-if="isAdmin" class="admin-entry">
        <div class="admin-entry-main">
          <div class="admin-icon">
            <NIcon :component="ShieldCheckmarkOutline" />
          </div>
          <div>
            <div class="admin-kicker">管理员工作台</div>
            <h2>用当前账号进入商城管理后台</h2>
            <p>统一使用商城账号登录，系统会根据管理员角色自动开放商品、分类、订单和用户管理能力。</p>
          </div>
        </div>
        <NSpace :size="10">
          <NButton secondary @click="router.push('/products')">
            <template #icon>
              <NIcon :component="StorefrontOutline" />
            </template>
            返回商城
          </NButton>
          <NButton type="primary" @click="enterAdmin">
            <template #icon>
              <NIcon :component="BarChartOutline" />
            </template>
            进入管理后台
          </NButton>
        </NSpace>
      </section>

      <NCard title="个人信息">
        <div class="profile-header" v-if="userInfo">
          <NAvatar :size="64" :src="userInfo.avatar" round>
            {{ userInfo.nickname?.charAt(0) || userInfo.username?.charAt(0) }}
          </NAvatar>
          <div class="profile-meta">
            <div class="username">{{ userInfo.username }}</div>
            <NTag :type="userInfo.role === 1 ? 'warning' : 'default'" size="small">
              {{ userInfo.role === 1 ? '管理员' : '普通用户' }}
            </NTag>
          </div>
        </div>

        <NDescriptions label-placement="left" bordered :column="1" class="info-desc" v-if="userInfo">
          <NDescriptionsItem label="用户名">{{ userInfo.username }}</NDescriptionsItem>
          <NDescriptionsItem label="注册时间">{{ userInfo.createTime }}</NDescriptionsItem>
          <NDescriptionsItem label="当前积分">{{ userInfo.points }}</NDescriptionsItem>
          <NDescriptionsItem label="会员等级">Lv.{{ userInfo.level }}</NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard title="编辑信息" style="margin-top: 16px">
        <NForm label-placement="left" label-width="80px">
          <NFormItem label="昵称">
            <NInput v-model:value="editForm.nickname" placeholder="请输入昵称" />
          </NFormItem>
          <NFormItem label="手机号">
            <NInput v-model:value="editForm.phone" placeholder="请输入手机号" />
          </NFormItem>
          <NFormItem label="邮箱">
            <NInput v-model:value="editForm.email" placeholder="请输入邮箱" />
          </NFormItem>
          <NFormItem label="性别">
            <NSelect
              v-model:value="editForm.gender"
              :options="genderOptions"
              placeholder="请选择性别"
            />
          </NFormItem>
          <NFormItem>
            <NSpace>
              <NButton type="primary" @click="handleSave" :loading="saving">保存修改</NButton>
            </NSpace>
          </NFormItem>
        </NForm>
      </NCard>
    </div>
  </NSpin>
</template>

<style scoped>
.user-profile {
  max-width: 860px;
  margin: 0 auto;
}

.admin-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
  padding: 22px;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(29, 78, 216, 0.88)),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.28), transparent 34%);
  color: #fff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
}

.admin-entry-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 28px;
}

.admin-kicker {
  color: #bbf7d0;
  font-size: 13px;
  font-weight: 700;
}

.admin-entry h2 {
  margin: 4px 0 6px;
  font-size: 22px;
  line-height: 1.25;
}

.admin-entry p {
  margin: 0;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.6;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.info-desc {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .admin-entry,
  .admin-entry-main {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
