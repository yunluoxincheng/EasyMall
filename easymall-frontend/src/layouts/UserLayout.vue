<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NInput,
  NButton,
  NIcon,
  NBadge,
  NDropdown,
  NSpace,
  useMessage,
  useDialog,
} from 'naive-ui'
import {
  CartOutline,
  PersonOutline,
  LogOutOutline,
  DocumentTextOutline,
  HeartOutline,
  StarOutline,
} from '@vicons/ionicons5'
import { useUserAuthStore } from '@/stores/userAuth'
import { useAuthStore } from '@/stores/auth'
import { getCartCount } from '@/api/user-cart'
import UserFooter from './UserFooter.vue'

const router = useRouter()
const route = useRoute()
const userAuth = useUserAuthStore()
const adminAuth = useAuthStore()
const message = useMessage()
const dialog = useDialog()

const searchKeyword = ref('')
const cartCount = ref(0)

async function fetchCartCount() {
  if (!userAuth.isLoggedIn) {
    cartCount.value = 0
    return
  }
  try {
    const res = await getCartCount()
    cartCount.value = res.data.data
  } catch {
    cartCount.value = 0
  }
}

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/products', query: { keyword } })
  }
}

function goToCart() {
  if (!userAuth.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/cart')
}

const userDropdownOptions = computed(() => {
  const options = [
    { label: '我的订单', key: 'orders', icon: () => h(NIcon, null, { default: () => h(DocumentTextOutline) }) },
    { label: '个人中心', key: 'profile', icon: () => h(NIcon, null, { default: () => h(PersonOutline) }) },
    { label: '我的收藏', key: 'favorites', icon: () => h(NIcon, null, { default: () => h(HeartOutline) }) },
    { label: '会员中心', key: 'member', icon: () => h(NIcon, null, { default: () => h(StarOutline) }) },
  ]

  return [
    ...options,
    { type: 'divider' as const },
    { label: '退出登录', key: 'logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) },
  ]
})

function handleUserAction(key: string) {
  switch (key) {
    case 'orders': router.push('/orders'); break
    case 'profile': router.push('/user'); break
    case 'favorites': router.push('/user/favorites'); break
    case 'member': router.push('/user/member'); break
    case 'logout':
      dialog.warning({
        title: '确认退出',
        content: '确定要退出登录吗？',
        positiveText: '退出',
        negativeText: '取消',
        onPositiveClick: () => {
          userAuth.logout()
          adminAuth.logout()
          message.success('已退出登录')
          router.push('/login')
        },
      })
      break
  }
}

const navItems = [
  { label: '商城首页', path: '/products' },
  { label: '优惠券', path: '/coupons' },
  { label: '积分商城', path: '/user/points/products' },
]

const activeNav = computed(() => {
  if (route.path === '/coupons') return '/coupons'
  if (route.path === '/user/points/products') return '/user/points/products'
  return '/products'
})

watch(() => userAuth.isLoggedIn, () => fetchCartCount())
watch(() => route.path, () => fetchCartCount())
onMounted(() => fetchCartCount())
</script>

<template>
  <NLayout class="user-layout">
    <NLayoutHeader bordered class="user-header">
      <div class="header-inner">
        <div class="header-left">
          <h1 class="logo" @click="router.push('/')">EasyMall</h1>
          <nav class="nav-links">
            <a
              v-for="item in navItems"
              :key="item.path"
              :class="{ active: activeNav === item.path }"
              @click="router.push(item.path)"
            >{{ item.label }}</a>
          </nav>
        </div>

        <div class="header-center">
          <NInput
            v-model:value="searchKeyword"
            placeholder="搜索商品"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <NButton text size="small" @click="handleSearch">搜索</NButton>
            </template>
          </NInput>
        </div>

        <div class="header-right">
          <NBadge :value="cartCount" :max="99" class="cart-badge">
            <NButton quaternary circle @click="goToCart">
              <template #icon>
                <NIcon :component="CartOutline" :size="20" />
              </template>
            </NButton>
          </NBadge>

          <template v-if="userAuth.isLoggedIn">
            <NDropdown
              :options="userDropdownOptions"
              @select="handleUserAction"
            >
              <NButton quaternary size="small">
                {{ userAuth.userInfo?.nickname || userAuth.userInfo?.username }}
              </NButton>
            </NDropdown>
          </template>
          <template v-else>
            <NSpace :size="8">
              <NButton text size="small" @click="router.push('/login')">登录</NButton>
              <NButton text size="small" @click="router.push('/register')">注册</NButton>
            </NSpace>
          </template>
        </div>
      </div>
    </NLayoutHeader>

    <NLayoutContent class="user-content">
      <router-view />
    </NLayoutContent>

    <UserFooter />
  </NLayout>
</template>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.user-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-links a {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  text-decoration: none;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.header-center {
  flex: 1;
  max-width: 400px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.cart-badge {
  cursor: pointer;
}

.user-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}
</style>
