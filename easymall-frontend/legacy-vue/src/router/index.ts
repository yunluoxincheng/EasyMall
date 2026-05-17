import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserAuthStore } from '@/stores/userAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 管理端路由
    {
      path: '/admin/login',
      name: 'AdminLogin',
      redirect: '/login',
      meta: { title: '管理端登录' },
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/admin/product',
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

    // 用户端路由
    {
      path: '/login',
      name: 'UserLogin',
      component: () => import('@/views/user-login/index.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'UserRegister',
      component: () => import('@/views/user-register/index.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/',
      component: () => import('@/layouts/UserLayout.vue'),
      redirect: '/products',
      children: [
        {
          path: 'products',
          name: 'ProductList',
          component: () => import('@/views/user-product/ProductList.vue'),
          meta: { title: '商品列表' },
        },
        {
          path: 'products/:id',
          name: 'ProductDetail',
          component: () => import('@/views/user-product/ProductDetail.vue'),
          meta: { title: '商品详情' },
        },
        {
          path: 'cart',
          name: 'Cart',
          component: () => import('@/views/user-cart/index.vue'),
          meta: { title: '购物车', requiresAuth: true },
        },
        {
          path: 'checkout',
          name: 'Checkout',
          component: () => import('@/views/user-checkout/index.vue'),
          meta: { title: '订单确认', requiresAuth: true },
        },
        {
          path: 'payment/:paymentNo',
          name: 'Payment',
          component: () => import('@/views/user-payment/index.vue'),
          meta: { title: '支付', requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/user-orders/OrderList.vue'),
          meta: { title: '我的订单', requiresAuth: true },
        },
        {
          path: 'orders/:id',
          name: 'OrderDetail',
          component: () => import('@/views/user-orders/OrderDetail.vue'),
          meta: { title: '订单详情', requiresAuth: true },
        },
        {
          path: 'coupons',
          name: 'CouponCenter',
          component: () => import('@/views/coupon-center/index.vue'),
          meta: { title: '优惠券中心' },
        },
        {
          path: 'user',
          name: 'UserProfile',
          component: () => import('@/views/user-profile/index.vue'),
          meta: { title: '个人中心', requiresAuth: true },
        },
        {
          path: 'user/password',
          name: 'ChangePassword',
          component: () => import('@/views/user-profile/ChangePassword.vue'),
          meta: { title: '修改密码', requiresAuth: true },
        },
        {
          path: 'user/favorites',
          name: 'Favorites',
          component: () => import('@/views/user-favorites/index.vue'),
          meta: { title: '我的收藏', requiresAuth: true },
        },
        {
          path: 'user/comments',
          name: 'MyComments',
          component: () => import('@/views/user-comments/index.vue'),
          meta: { title: '我的评论', requiresAuth: true },
        },
        {
          path: 'user/coupons',
          name: 'MyCoupons',
          component: () => import('@/views/user-coupons/index.vue'),
          meta: { title: '我的优惠券', requiresAuth: true },
        },
        {
          path: 'user/points',
          name: 'Points',
          component: () => import('@/views/user-points/index.vue'),
          meta: { title: '积分记录', requiresAuth: true },
        },
        {
          path: 'user/points/products',
          name: 'PointsProducts',
          component: () => import('@/views/user-points/PointsProducts.vue'),
          meta: { title: '积分商品', requiresAuth: true },
        },
        {
          path: 'user/member',
          name: 'Member',
          component: () => import('@/views/user-member/index.vue'),
          meta: { title: '会员中心', requiresAuth: true },
        },
        {
          path: 'user/signin',
          name: 'SignIn',
          component: () => import('@/views/user-signin/index.vue'),
          meta: { title: '每日签到', requiresAuth: true },
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  // 管理端路由守卫
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login') {
      next('/login')
      return
    }
    const auth = useAuthStore()
    const userAuth = useUserAuthStore()
    if (auth.isLoggedIn && auth.isAdmin) {
      next()
    } else if (userAuth.isLoggedIn && userAuth.userInfo?.role === 1 && userAuth.token) {
      auth.setLogin(userAuth.token, 1)
      next()
    } else {
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
    return
  }

  // 用户端登录/注册页不需要守卫
  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  // 用户端受保护路由
  if (to.meta.requiresAuth) {
    const userAuth = useUserAuthStore()
    if (!userAuth.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
    return
  }

  next()
})

export default router
