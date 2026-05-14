import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const role = ref(Number(localStorage.getItem('role')) || 0)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 1)

  function setLogin(newToken: string, newRole: number) {
    token.value = newToken
    role.value = newRole
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', String(newRole))
  }

  function logout() {
    token.value = ''
    role.value = 0
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  return { token, role, isLoggedIn, isAdmin, setLogin, logout }
})
