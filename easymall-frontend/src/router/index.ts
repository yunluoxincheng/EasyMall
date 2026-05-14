import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/product',
      children: [
        {
          path: 'product',
          name: 'Product',
          component: () => import('@/views/product/ProductList.vue'),
          meta: { title: '商品管理' },
        },
        {
          path: 'category',
          name: 'Category',
          component: () => import('@/views/category/CategoryList.vue'),
          meta: { title: '分类管理' },
        },
        {
          path: 'order',
          name: 'Order',
          component: () => import('@/views/order/OrderList.vue'),
          meta: { title: '订单管理' },
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/user/UserList.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'coupon',
          name: 'Coupon',
          component: () => import('@/views/coupon/CouponList.vue'),
          meta: { title: '优惠券管理' },
        },
        {
          path: 'comment',
          name: 'Comment',
          component: () => import('@/views/comment/CommentList.vue'),
          meta: { title: '评论审核' },
        },
        {
          path: 'member-level',
          name: 'MemberLevel',
          component: () => import('@/views/memberLevel/MemberLevelList.vue'),
          meta: { title: '会员等级' },
        },
        {
          path: 'points-product',
          name: 'PointsProduct',
          component: () => import('@/views/pointsProduct/PointsProductList.vue'),
          meta: { title: '积分商品' },
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  const auth = useAuthStore()
  if (!auth.isLoggedIn || !auth.isAdmin) {
    next('/login')
  } else {
    next()
  }
})

export default router
