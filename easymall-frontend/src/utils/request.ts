import axios from 'axios'
import type { Result } from '@/types/api'

const request = axios.create({
  baseURL: '',
  timeout: 10000,
})

function getTokenKey(): string {
  const path = window.location.pathname
  return path.startsWith('/admin') ? 'admin_token' : 'user_token'
}

function getLoginPath(): string {
  const path = window.location.pathname
  return path.startsWith('/admin') ? '/admin/login' : '/login'
}

request.interceptors.request.use((config) => {
  const tokenKey = getTokenKey()
  const token = localStorage.getItem(tokenKey)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data as Result<unknown>
    if (res.success === false) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const tokenKey = getTokenKey()
      localStorage.removeItem(tokenKey)
      if (tokenKey === 'admin_token') {
        localStorage.removeItem('role')
      }
      window.location.href = getLoginPath()
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  },
)

export default request
