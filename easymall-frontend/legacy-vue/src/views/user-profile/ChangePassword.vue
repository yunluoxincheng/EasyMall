<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { updatePassword } from '@/api/user-user'
import { useUserAuthStore } from '@/stores/userAuth'

const router = useRouter()
const message = useMessage()
const userAuth = useUserAuthStore()
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)

const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (value !== formData.value.newPassword) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: 'blur',
    },
  ],
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    await updatePassword({
      oldPassword: formData.value.oldPassword,
      newPassword: formData.value.newPassword,
    })
    message.success('密码修改成功，请重新登录')
    userAuth.logout()
    router.push('/login')
  } catch {
    message.error('密码修改失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="change-password">
    <NCard title="修改密码">
      <NForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
        style="max-width: 400px"
      >
        <NFormItem label="旧密码" path="oldPassword">
          <NInput
            v-model:value="formData.oldPassword"
            type="password"
            show-password-on="click"
            placeholder="请输入旧密码"
          />
        </NFormItem>
        <NFormItem label="新密码" path="newPassword">
          <NInput
            v-model:value="formData.newPassword"
            type="password"
            show-password-on="click"
            placeholder="请输入新密码"
          />
        </NFormItem>
        <NFormItem label="确认密码" path="confirmPassword">
          <NInput
            v-model:value="formData.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入新密码"
          />
        </NFormItem>
        <NFormItem>
          <NSpace>
            <NButton type="primary" @click="handleSubmit" :loading="submitting">
              提交修改
            </NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.change-password {
  max-width: 600px;
  margin: 0 auto;
}
</style>
