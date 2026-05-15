<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NIcon,
  useDialog,
  useMessage,
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  BagOutline,
  GridOutline,
  DocumentTextOutline,
  PeopleOutline,
  TicketOutline,
  ChatboxOutline,
  StarOutline,
  GiftOutline,
  LogOutOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const dialog = useDialog()
const message = useMessage()
const collapsed = ref(false)

function renderIcon(icon: unknown) {
  return () => h(NIcon, null, { default: () => h(icon as Parameters<typeof h>[0]) })
}

const menuOptions: MenuOption[] = [
  { label: '商品管理', key: '/admin/product', icon: renderIcon(BagOutline) },
  { label: '分类管理', key: '/admin/category', icon: renderIcon(GridOutline) },
  { label: '订单管理', key: '/admin/order', icon: renderIcon(DocumentTextOutline) },
  { label: '用户管理', key: '/admin/user', icon: renderIcon(PeopleOutline) },
  { label: '优惠券管理', key: '/admin/coupon', icon: renderIcon(TicketOutline) },
  { label: '评论审核', key: '/admin/comment', icon: renderIcon(ChatboxOutline) },
  { label: '会员等级', key: '/admin/member-level', icon: renderIcon(StarOutline) },
  { label: '积分商品', key: '/admin/points-product', icon: renderIcon(GiftOutline) },
]

const activeKey = computed(() => route.path)

function handleMenuUpdate(key: string) {
  router.push(key)
}

const pageTitle = computed(() => (route.meta.title as string) || '管理后台')

function handleLogout() {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '退出',
    negativeText: '取消',
    onPositiveClick: () => {
      auth.logout()
      message.success('已退出登录')
      router.push('/admin/login')
    },
  })
}
</script>

<template>
  <NLayout has-sider class="admin-layout">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="sider-logo">
        <span v-if="!collapsed" class="logo-text">EasyMall</span>
        <span v-else class="logo-text logo-text-sm">E</span>
      </div>
      <NMenu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuUpdate"
      />
    </NLayoutSider>

    <NLayout>
      <NLayoutHeader bordered class="admin-header">
        <div class="header-left">
          <h2 class="page-title">{{ pageTitle }}</h2>
          <NBreadcrumb>
            <NBreadcrumbItem>首页</NBreadcrumbItem>
            <NBreadcrumbItem>{{ pageTitle }}</NBreadcrumbItem>
          </NBreadcrumb>
        </div>
        <div class="header-right">
          <NButton text @click="handleLogout">
            <template #icon>
              <NIcon :component="LogOutOutline" />
            </template>
            退出
          </NButton>
        </div>
      </NLayoutHeader>

      <NLayoutContent class="admin-content">
        <router-view />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.admin-layout {
  height: 100%;
}

.sider-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text-sm {
  font-size: 24px;
}

.admin-header {
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-content {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100% - 56px);
}
</style>
