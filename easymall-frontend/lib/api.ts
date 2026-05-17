import { request } from "@/lib/http";
import type {
  AdminOrderQuery,
  AdminProductQuery,
  CategoryFormData,
  CategoryPageItem,
  CategoryQuery,
  CategoryVO,
  CartVO,
  CommentCreateDTO,
  CommentPageItem,
  CommentQuery,
  CouponCalculateResultVO,
  CouponQuery,
  CouponStatistics,
  CouponTemplateDTO,
  CouponTemplateVO,
  CouponUsageLogVO,
  FavoriteVO,
  ListPage,
  LoginVO,
  MemberLevelFormData,
  MemberLevelItem,
  MemberLevelVO,
  MyBatisPage,
  OrderCreateDTO,
  OrderCreateVO,
  OrderDetailAdmin,
  OrderItemVO,
  OrderPageItem,
  OrderQuery,
  OrderVO,
  PasswordUpdateDTO,
  PaymentVO,
  PointsExchangeVO,
  PointsProductFormData,
  PointsProductPageItem,
  PointsProductQuery,
  PointsProductVO,
  PointsRecordVO,
  ProductDetail,
  ProductFormData,
  ProductPageItem,
  ProductQuery,
  ProductVO,
  SessionUser,
  SignInResultVO,
  UsageLogQuery,
  UserCommentVO,
  UserCouponVO,
  UserPageItem,
  UserQuery,
  UserRegisterDTO,
  UserUpdateDTO,
  UserVO,
} from "@/lib/types";

function normalizePage<T>(page: MyBatisPage<T> | ListPage<T>): ListPage<T> {
  if ("current" in page && "size" in page) {
    return {
      records: page.records,
      total: page.total,
      pageNum: page.current,
      pageSize: page.size,
      pages: page.pages,
    };
  }

  return page;
}

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    request<LoginVO>("/api/user/login", {
      body: payload,
      method: "POST",
      withAuth: false,
    }),
  register: (payload: UserRegisterDTO) =>
    request<null>("/api/user/register", {
      body: payload,
      method: "POST",
      withAuth: false,
    }),
  getCurrentUser: () => request<UserVO>("/api/user/info"),
  updateCurrentUser: (payload: UserUpdateDTO) =>
    request<null>("/api/user/info", {
      body: payload,
      method: "PUT",
    }),
  updatePassword: (payload: PasswordUpdateDTO) =>
    request<null>("/api/user/password", {
      method: "PUT",
      params: payload,
    }),
  logout: () =>
    request<null>("/api/user/logout", {
      method: "POST",
    }),
};

export const storefrontApi = {
  getCategoryTree: () => request<CategoryVO[]>("/api/category/tree", { withAuth: false }),
  getProducts: async (params: ProductQuery) =>
    normalizePage(await request<ListPage<ProductVO>>("/api/product/page", { params, withAuth: false })),
  getProductById: (id: number) =>
    request<ProductVO>(`/api/product/${id}`, { withAuth: false }),
  getHotProducts: (limit = 8) =>
    request<ProductVO[]>("/api/product/hot", {
      params: { limit },
      withAuth: false,
    }),
  getNewProducts: (limit = 8) =>
    request<ProductVO[]>("/api/product/new", {
      params: { limit },
      withAuth: false,
    }),
  getRelatedProducts: (categoryId: number, productId: number, limit = 5) =>
    request<ProductVO[]>("/api/product/related", {
      params: { categoryId, productId, limit },
      withAuth: false,
    }),
  getCartList: () => request<CartVO[]>("/api/cart/list"),
  getCartCount: () => request<number>("/api/cart/count"),
  addToCart: (productId: number, quantity: number) =>
    request<null>("/api/cart/add", {
      body: { productId, quantity },
      method: "POST",
    }),
  updateCartItem: (cartId: number, quantity: number) =>
    request<null>(`/api/cart/${cartId}`, {
      body: { quantity },
      method: "PUT",
    }),
  deleteCartItem: (cartId: number) =>
    request<null>(`/api/cart/${cartId}`, {
      method: "DELETE",
    }),
  batchDeleteCartItems: (cartIds: number[]) =>
    request<null>("/api/cart/batch", {
      body: cartIds,
      method: "DELETE",
    }),
  selectAllCart: (selected: boolean) =>
    request<null>(`/api/cart/selectAll/${selected}`, {
      method: "PUT",
    }),
  batchSelectCart: (selected: boolean, cartIds: number[]) =>
    request<null>(`/api/cart/batchSelect/${selected}`, {
      body: cartIds,
      method: "PUT",
    }),
  createOrder: (payload: OrderCreateDTO) =>
    request<OrderCreateVO>("/api/order/create", {
      body: payload,
      method: "POST",
    }),
  getOrders: async (params: OrderQuery) =>
    normalizePage(await request<ListPage<OrderVO>>("/api/order/page", { params })),
  getOrderById: (orderId: number) => request<OrderVO>(`/api/order/${orderId}`),
  getOrderPayment: (orderId: number) =>
    request<PaymentVO>(`/api/order/${orderId}/payment`),
  cancelOrder: (orderId: number) =>
    request<null>(`/api/order/${orderId}/cancel`, {
      method: "PUT",
    }),
  confirmOrder: (orderId: number) =>
    request<null>(`/api/order/${orderId}/confirm`, {
      method: "PUT",
    }),
  getPaymentByPaymentNo: (paymentNo: string) =>
    request<PaymentVO>(`/api/payment/${paymentNo}`),
  payByPaymentNo: (paymentNo: string) =>
    request<PaymentVO>(`/api/payment/${paymentNo}/pay`, {
      method: "POST",
    }),
  getPaymentByOrderId: (orderId: number) =>
    request<PaymentVO>(`/api/payment/order/${orderId}`),
  getCouponTemplates: () => request<CouponTemplateVO[]>("/api/coupon/templates"),
  receiveCoupon: (templateId: number) =>
    request<null>(`/api/coupon/receive/${templateId}`, { method: "POST" }),
  getMyCoupons: async (params: { status?: number; pageNum?: number; pageSize?: number }) =>
    normalizePage(await request<ListPage<UserCouponVO>>("/api/coupon/my", { params })),
  getAvailableCoupons: (orderAmount: number) =>
    request<UserCouponVO[]>("/api/coupon/available", {
      params: { orderAmount },
    }),
  calculateCoupon: (userCouponId: number, orderAmount: number) =>
    request<CouponCalculateResultVO>("/api/coupon/calculate", {
      body: { userCouponId, orderAmount },
      method: "POST",
    }),
  addFavorite: (productId: number) =>
    request<null>(`/api/favorite/add/${productId}`, {
      method: "POST",
    }),
  removeFavorite: (productId: number) =>
    request<null>(`/api/favorite/remove/${productId}`, {
      method: "DELETE",
    }),
  toggleFavorite: (productId: number) =>
    request<boolean>(`/api/favorite/${productId}/toggle`, {
      method: "POST",
    }),
  checkFavorite: (productId: number) =>
    request<boolean>(`/api/favorite/${productId}/check`),
  getFavorites: async (params: { pageNum?: number; pageSize?: number }) =>
    normalizePage(await request<ListPage<FavoriteVO>>("/api/favorite/page", { params })),
  createComment: (payload: CommentCreateDTO) =>
    request<null>("/api/comment/create", {
      body: payload,
      method: "POST",
    }),
  getProductComments: async (
    productId: number,
    params: { pageNum?: number; pageSize?: number },
  ) =>
    normalizePage(
      await request<ListPage<UserCommentVO>>(`/api/comment/product/${productId}`, { params }),
    ),
  getMyComments: async (params: { pageNum?: number; pageSize?: number }) =>
    normalizePage(await request<ListPage<UserCommentVO>>("/api/comment/user", { params })),
  deleteMyComment: (commentId: number) =>
    request<null>(`/api/comment/${commentId}`, {
      method: "DELETE",
    }),
  getMemberLevels: () => request<MemberLevelVO[]>("/api/member/levels"),
  getCurrentMemberLevel: () => request<MemberLevelVO>("/api/member/level"),
  getMemberDiscount: () => request<number>("/api/member/discount"),
  getPointsRecords: async (params: { pageNum?: number; pageSize?: number }) =>
    normalizePage(await request<ListPage<PointsRecordVO>>("/api/points/records", { params })),
  getPointsProducts: () => request<PointsProductVO[]>("/api/points/exchange/products"),
  exchangePointsProduct: (payload: {
    productId: number;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    remark?: string;
  }) =>
    request<PointsExchangeVO>("/api/points/exchange", {
      body: payload,
      method: "POST",
    }),
  getExchangeRecords: async (params: { pageNum?: number; pageSize?: number }) =>
    normalizePage(await request<ListPage<PointsExchangeVO>>("/api/points/exchange/records", { params })),
  doSignIn: () =>
    request<SignInResultVO>("/api/signin/do", {
      method: "POST",
    }),
  getSignInStatus: () => request<SignInResultVO>("/api/signin/status"),
  getContinuousDays: () => request<number>("/api/signin/continuous"),
};

export const adminApi = {
  getProducts: async (params: AdminProductQuery) =>
    normalizePage(await request<ListPage<ProductPageItem>>("/api/admin/products", { params })),
  getProductById: (id: number) => request<ProductDetail>(`/api/admin/products/${id}`),
  createProduct: (payload: ProductFormData) =>
    request<null>("/api/admin/products", {
      body: payload,
      method: "POST",
    }),
  updateProduct: (id: number, payload: ProductFormData) =>
    request<null>(`/api/admin/products/${id}`, {
      body: payload,
      method: "PUT",
    }),
  updateProductStatus: (id: number, status: number) =>
    request<null>(`/api/admin/products/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  updateProductStock: (id: number, stock: number) =>
    request<null>(`/api/admin/products/${id}/stock`, {
      method: "PUT",
      params: { stock },
    }),
  deleteProduct: (id: number) =>
    request<null>(`/api/admin/products/${id}`, {
      method: "DELETE",
    }),
  getCategories: async (params: CategoryQuery) =>
    normalizePage(await request<ListPage<CategoryPageItem>>("/api/admin/categories", { params })),
  createCategory: (payload: CategoryFormData) =>
    request<null>("/api/admin/categories", {
      body: payload,
      method: "POST",
    }),
  updateCategory: (id: number, payload: CategoryFormData) =>
    request<null>(`/api/admin/categories/${id}`, {
      body: payload,
      method: "PUT",
    }),
  updateCategoryStatus: (id: number, status: number) =>
    request<null>(`/api/admin/categories/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  deleteCategory: (id: number) =>
    request<null>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    }),
  getOrders: async (params: AdminOrderQuery) =>
    normalizePage(await request<ListPage<OrderPageItem>>("/api/admin/orders", { params })),
  getOrderById: (id: number) => request<OrderDetailAdmin>(`/api/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: number) =>
    request<null>(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  cancelOrder: (id: number) =>
    request<null>(`/api/admin/orders/${id}/cancel`, {
      method: "PUT",
    }),
  getUsers: async (params: UserQuery) =>
    normalizePage(await request<ListPage<UserPageItem>>("/api/admin/users", { params })),
  getUserById: (id: number) => request<UserVO>(`/api/admin/users/${id}`),
  updateUserStatus: (id: number, status: number) =>
    request<null>(`/api/admin/users/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  updateUserRole: (id: number, role: number) =>
    request<null>(`/api/admin/users/${id}/role`, {
      method: "PUT",
      params: { role },
    }),
  updateUserPoints: (id: number, points: number) =>
    request<null>(`/api/admin/users/${id}/points`, {
      method: "PUT",
      params: { points },
    }),
  getCoupons: async (params: CouponQuery) =>
    normalizePage(await request<MyBatisPage<CouponTemplateVO>>("/api/admin/coupon/templates", { params })),
  getCouponById: (id: number) =>
    request<CouponTemplateVO>(`/api/admin/coupon/template/${id}`),
  createCoupon: (payload: CouponTemplateDTO) =>
    request<number>("/api/admin/coupon/template", {
      body: payload,
      method: "POST",
    }),
  updateCoupon: (payload: CouponTemplateDTO) =>
    request<null>("/api/admin/coupon/template", {
      body: payload,
      method: "PUT",
    }),
  updateCouponStatus: (id: number, status: number) =>
    request<null>(`/api/admin/coupon/template/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  deleteCoupon: (id: number) =>
    request<null>(`/api/admin/coupon/template/${id}`, {
      method: "DELETE",
    }),
  getCouponUsageLogs: async (params: UsageLogQuery) =>
    normalizePage(await request<MyBatisPage<CouponUsageLogVO>>("/api/admin/coupon/usage-logs", { params })),
  getCouponStatistics: () =>
    request<CouponStatistics>("/api/admin/coupon/statistics"),
  getComments: async (params: CommentQuery) =>
    normalizePage(await request<ListPage<CommentPageItem>>("/api/admin/comments", { params })),
  approveComment: (id: number) =>
    request<null>(`/api/admin/comments/${id}/approve`, { method: "PUT" }),
  rejectComment: (id: number) =>
    request<null>(`/api/admin/comments/${id}/reject`, { method: "PUT" }),
  replyComment: (id: number, reply: string) =>
    request<null>(`/api/admin/comments/${id}/reply`, {
      body: { reply },
      method: "PUT",
    }),
  deleteComment: (id: number) =>
    request<null>(`/api/admin/comments/${id}`, { method: "DELETE" }),
  getMemberLevels: () => request<MemberLevelItem[]>("/api/admin/member-levels"),
  createMemberLevel: (payload: MemberLevelFormData) =>
    request<null>("/api/admin/member-levels", {
      body: payload,
      method: "POST",
    }),
  updateMemberLevel: (id: number, payload: MemberLevelFormData) =>
    request<null>(`/api/admin/member-levels/${id}`, {
      body: payload,
      method: "PUT",
    }),
  updateMemberLevelStatus: (id: number, status: number) =>
    request<null>(`/api/admin/member-levels/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  deleteMemberLevel: (id: number) =>
    request<null>(`/api/admin/member-levels/${id}`, { method: "DELETE" }),
  getPointsProducts: async (params: PointsProductQuery) =>
    normalizePage(await request<ListPage<PointsProductPageItem>>("/api/admin/points-products", { params })),
  createPointsProduct: (payload: PointsProductFormData) =>
    request<null>("/api/admin/points-products", {
      body: payload,
      method: "POST",
    }),
  updatePointsProduct: (id: number, payload: PointsProductFormData) =>
    request<null>(`/api/admin/points-products/${id}`, {
      body: payload,
      method: "PUT",
    }),
  updatePointsProductStatus: (id: number, status: number) =>
    request<null>(`/api/admin/points-products/${id}/status`, {
      method: "PUT",
      params: { status },
    }),
  deletePointsProduct: (id: number) =>
    request<null>(`/api/admin/points-products/${id}`, { method: "DELETE" }),
};

export function mapLoginToSessionUser(login: LoginVO): SessionUser {
  return {
    id: login.userId,
    username: login.username,
    nickname: login.nickname,
    avatar: login.avatar,
    role: login.role,
  };
}

export const paymentApi = {
  getByPaymentNo: storefrontApi.getPaymentByPaymentNo,
  payByPaymentNo: storefrontApi.payByPaymentNo,
};

export type { ListPage };
