<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { userLogin } from '@/api/user-user'
import { useUserAuthStore } from '@/stores/userAuth'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userAuth = useUserAuthStore()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const res = await userLogin(formData)
    const { token, userId, username, nickname, avatar, role } = res.data.data
    userAuth.setLogin(token, { id: userId, username, nickname, avatar: avatar || '', phone: '', email: '', role, points: 0 })
    message.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '用户名或密码错误'
    message.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">登录 EasyMall</h2>
      <NForm ref="formRef" :model="formData" :rules="rules">
        <NFormItem path="username">
          <NInput v-model:value="formData.username" placeholder="请输入用户名" size="large" @keyup.enter="handleLogin" />
        </NFormItem>
        <NFormItem path="password">
          <NInput v-model:value="formData.password" type="password" show-password-on="click" placeholder="请输入密码" size="large" @keyup.enter="handleLogin" />
        </NFormItem>
        <NButton type="primary" block size="large" :loading="loading" @click="handleLogin">登 录</NButton>
      </NForm>
      <div class="login-footer">
        还没有账号？<a @click="router.push('/register')">立即注册</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 32px;
  color: #333;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.login-footer a {
  color: #667eea;
  cursor: pointer;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
