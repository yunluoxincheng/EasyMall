<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
} from 'naive-ui'
import { getUserInfo, updateUserInfo } from '@/api/user-user'
import type { UserVO, UserUpdateDTO } from '@/types/user-user'

const message = useMessage()
const loading = ref(true)
const saving = ref(false)
const userInfo = ref<UserVO | null>(null)

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
</script>

<template>
  <NSpin :show="loading">
    <div class="user-profile">
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
  max-width: 700px;
  margin: 0 auto;
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
</style>
