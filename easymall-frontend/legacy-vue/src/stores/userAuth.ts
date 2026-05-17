import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TOKEN_KEY = 'user_token'
const USER_INFO_KEY = 'user_info'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  avatar: string
  role: number
  points: number
}

export const useUserAuthStore = defineStore('userAuth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null'),
  )

  const isLoggedIn = computed(() => !!token.value)

  function setLogin(newToken: string, info: UserInfo) {
    token.value = newToken
    userInfo.value = info
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }

  return { token, userInfo, isLoggedIn, setLogin, logout }
})
