<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { userRegister } from '@/api/user-user'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
})

const rules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  nickname: { required: true, message: '请输入昵称', trigger: 'blur' },
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value) => value === formData.password,
      message: '两次密码不一致',
      trigger: 'blur',
    },
  ],
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '手机号格式不正确',
    trigger: 'blur',
  },
  email: {
    type: 'email',
    message: '邮箱格式不正确',
    trigger: 'blur',
  },
}

async function handleRegister() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await userRegister({
      username: formData.username,
      nickname: formData.nickname,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    })
    message.success('注册成功，请登录')
    router.push('/login')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '注册失败'
    message.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <h2 class="register-title">注册 EasyMall</h2>
      <NForm ref="formRef" :model="formData" :rules="rules">
        <NFormItem path="username" label="用户名">
          <NInput v-model:value="formData.username" placeholder="请输入用户名" />
        </NFormItem>
        <NFormItem path="nickname" label="昵称">
          <NInput v-model:value="formData.nickname" placeholder="请输入昵称" />
        </NFormItem>
        <NFormItem path="password" label="密码">
          <NInput v-model:value="formData.password" type="password" show-password-on="click" placeholder="请输入密码（至少6位）" />
        </NFormItem>
        <NFormItem path="confirmPassword" label="确认密码">
          <NInput v-model:value="formData.confirmPassword" type="password" show-password-on="click" placeholder="请再次输入密码" />
        </NFormItem>
        <NFormItem path="phone" label="手机号（选填）">
          <NInput v-model:value="formData.phone" placeholder="请输入手机号" />
        </NFormItem>
        <NFormItem path="email" label="邮箱（选填）">
          <NInput v-model:value="formData.email" placeholder="请输入邮箱" />
        </NFormItem>
        <NButton type="primary" block size="large" :loading="loading" @click="handleRegister">注 册</NButton>
      </NForm>
      <div class="register-footer">
        已有账号？<a @click="router.push('/login')">立即登录</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 440px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.register-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 32px;
  color: #333;
}

.register-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.register-footer a {
  color: #667eea;
  cursor: pointer;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
