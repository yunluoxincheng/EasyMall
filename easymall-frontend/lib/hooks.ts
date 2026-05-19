import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi, storefrontApi, adminApi } from "@/lib/api";
import type {
  AdminOrderQuery,
  AdminProductQuery,
  CategoryQuery,
  CommentQuery,
  CouponQuery,
  OrderQuery,
  PointsProductQuery,
  ProductQuery,
  UsageLogQuery,
  UserQuery,
} from "@/lib/types";

// ─── Query Key Factory ───

export const keys = {
  categories: {
    tree: ["categories", "tree"] as const,
  },
  products: {
    page: (params: ProductQuery) => ["products", "page", params] as const,
    hot: (limit: number) => ["products", "hot", limit] as const,
    new: (limit: number) => ["products", "new", limit] as const,
    detail: (id: number) => ["products", "detail", id] as const,
    related: (categoryId: number, productId: number, limit: number) =>
      ["products", "related", categoryId, productId, limit] as const,
  },
  cart: {
    list: ["cart", "list"] as const,
    count: ["cart", "count"] as const,
  },
  orders: {
    page: (params: OrderQuery) => ["orders", "page", params] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
    payment: (orderId: number) => ["orders", "payment", orderId] as const,
  },
  payments: {
    byNo: (paymentNo: string) => ["payments", "byNo", paymentNo] as const,
  },
  favorites: {
    page: (params: { pageNum?: number; pageSize?: number }) =>
      ["favorites", "page", params] as const,
    check: (productId: number) => ["favorites", "check", productId] as const,
  },
  comments: {
    product: (productId: number, params: { pageNum?: number; pageSize?: number }) =>
      ["comments", "product", productId, params] as const,
    count: (productId: number) => ["comments", "count", productId] as const,
    rating: (productId: number) => ["comments", "rating", productId] as const,
    mine: (params: { pageNum?: number; pageSize?: number }) =>
      ["comments", "mine", params] as const,
  },
  coupons: {
    templates: ["coupons", "templates"] as const,
    mine: (params: { status?: number; pageNum?: number; pageSize?: number }) =>
      ["coupons", "mine", params] as const,
    available: (orderAmount: number) => ["coupons", "available", orderAmount] as const,
  },
  member: {
    levels: ["member", "levels"] as const,
    current: ["member", "current"] as const,
    discount: ["member", "discount"] as const,
  },
  points: {
    records: (params: { pageNum?: number; pageSize?: number }) =>
      ["points", "records", params] as const,
    products: ["points", "products"] as const,
    exchangeRecords: (params: { pageNum?: number; pageSize?: number }) =>
      ["points", "exchangeRecords", params] as const,
  },
  signin: {
    status: ["signin", "status"] as const,
  },
  user: {
    profile: ["user", "profile"] as const,
  },
  admin: {
    products: (params: AdminProductQuery) => ["admin", "products", params] as const,
    productDetail: (id: number) => ["admin", "products", id] as const,
    categories: (params: CategoryQuery) => ["admin", "categories", params] as const,
    orders: (params: AdminOrderQuery) => ["admin", "orders", params] as const,
    orderDetail: (id: number) => ["admin", "orders", id] as const,
    users: (params: UserQuery) => ["admin", "users", params] as const,
    userDetail: (id: number) => ["admin", "users", id] as const,
    coupons: (params: CouponQuery) => ["admin", "coupons", params] as const,
    couponDetail: (id: number) => ["admin", "coupons", id] as const,
    couponUsageLogs: (params: UsageLogQuery) =>
      ["admin", "couponUsageLogs", params] as const,
    couponStatistics: ["admin", "couponStatistics"] as const,
    comments: (params: CommentQuery) => ["admin", "comments", params] as const,
    memberLevels: ["admin", "memberLevels"] as const,
    pointsProducts: (params: PointsProductQuery) =>
      ["admin", "pointsProducts", params] as const,
  },
};

// ─── Storefront Queries ───

export function useCategoryTree() {
  return useQuery({
    queryKey: keys.categories.tree,
    queryFn: () => storefrontApi.getCategoryTree(),
  });
}

export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: keys.products.page(params),
    queryFn: () => storefrontApi.getProducts(params),
  });
}

export function useHotProducts(limit = 8) {
  return useQuery({
    queryKey: keys.products.hot(limit),
    queryFn: () => storefrontApi.getHotProducts(limit),
  });
}

export function useNewProducts(limit = 8) {
  return useQuery({
    queryKey: keys.products.new(limit),
    queryFn: () => storefrontApi.getNewProducts(limit),
  });
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: keys.products.detail(id),
    queryFn: () => storefrontApi.getProductById(id),
    enabled: id > 0,
  });
}

export function useRelatedProducts(categoryId: number, productId: number, limit = 5) {
  return useQuery({
    queryKey: keys.products.related(categoryId, productId, limit),
    queryFn: () => storefrontApi.getRelatedProducts(categoryId, productId, limit),
    enabled: categoryId > 0,
  });
}

export function useCartList() {
  return useQuery({
    queryKey: keys.cart.list,
    queryFn: () => storefrontApi.getCartList(),
  });
}

export function useCartCount() {
  return useQuery({
    queryKey: keys.cart.count,
    queryFn: () => storefrontApi.getCartCount(),
  });
}

export function useOrders(params: OrderQuery) {
  return useQuery({
    queryKey: keys.orders.page(params),
    queryFn: () => storefrontApi.getOrders(params),
  });
}

export function useOrderDetail(id: number) {
  return useQuery({
    queryKey: keys.orders.detail(id),
    queryFn: () => storefrontApi.getOrderById(id),
    enabled: id > 0,
  });
}

export function useOrderPayment(orderId: number) {
  return useQuery({
    queryKey: keys.orders.payment(orderId),
    queryFn: () => storefrontApi.getOrderPayment(orderId),
    enabled: orderId > 0,
  });
}

export function usePaymentByNo(paymentNo: string) {
  return useQuery({
    queryKey: keys.payments.byNo(paymentNo),
    queryFn: () => storefrontApi.getPaymentByPaymentNo(paymentNo),
    enabled: Boolean(paymentNo),
  });
}

export function useFavorites(params: { pageNum?: number; pageSize?: number }) {
  return useQuery({
    queryKey: keys.favorites.page(params),
    queryFn: () => storefrontApi.getFavorites(params),
  });
}

export function useFavoriteCheck(productId: number, enabled = true) {
  return useQuery({
    queryKey: keys.favorites.check(productId),
    queryFn: () => storefrontApi.checkFavorite(productId),
    enabled,
  });
}

export function useProductComments(
  productId: number,
  params: { pageNum?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: keys.comments.product(productId, params),
    queryFn: () => storefrontApi.getProductComments(productId, params),
    enabled: productId > 0,
  });
}

export function useProductCommentCount(productId: number) {
  return useQuery({
    queryKey: keys.comments.count(productId),
    queryFn: () => storefrontApi.getProductCommentCount(productId),
    enabled: productId > 0,
  });
}

export function useProductRating(productId: number) {
  return useQuery({
    queryKey: keys.comments.rating(productId),
    queryFn: () => storefrontApi.getProductRating(productId),
    enabled: productId > 0,
  });
}

export function useMyComments(params: { pageNum?: number; pageSize?: number }) {
  return useQuery({
    queryKey: keys.comments.mine(params),
    queryFn: () => storefrontApi.getMyComments(params),
  });
}

export function useCouponTemplates() {
  return useQuery({
    queryKey: keys.coupons.templates,
    queryFn: () => storefrontApi.getCouponTemplates(),
  });
}

export function useMyCoupons(params: { status?: number; pageNum?: number; pageSize?: number }) {
  return useQuery({
    queryKey: keys.coupons.mine(params),
    queryFn: () => storefrontApi.getMyCoupons(params),
  });
}

export function useAvailableCoupons(orderAmount: number) {
  return useQuery({
    queryKey: keys.coupons.available(orderAmount),
    queryFn: () => storefrontApi.getAvailableCoupons(orderAmount),
    enabled: orderAmount > 0,
  });
}

export function useMemberLevels() {
  return useQuery({
    queryKey: keys.member.levels,
    queryFn: () => storefrontApi.getMemberLevels(),
  });
}

export function useCurrentMemberLevel() {
  return useQuery({
    queryKey: keys.member.current,
    queryFn: () => storefrontApi.getCurrentMemberLevel(),
  });
}

export function useMemberDiscount() {
  return useQuery({
    queryKey: keys.member.discount,
    queryFn: () => storefrontApi.getMemberDiscount(),
  });
}

export function usePointsRecords(params: { pageNum?: number; pageSize?: number }) {
  return useQuery({
    queryKey: keys.points.records(params),
    queryFn: () => storefrontApi.getPointsRecords(params),
  });
}

export function usePointsProducts() {
  return useQuery({
    queryKey: keys.points.products,
    queryFn: () => storefrontApi.getPointsProducts(),
  });
}

export function useExchangeRecords(params: { pageNum?: number; pageSize?: number }) {
  return useQuery({
    queryKey: keys.points.exchangeRecords(params),
    queryFn: () => storefrontApi.getExchangeRecords(params),
  });
}

export function useSignInStatus() {
  return useQuery({
    queryKey: keys.signin.status,
    queryFn: () => storefrontApi.getSignInStatus(),
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: keys.user.profile,
    queryFn: () => authApi.getCurrentUser(),
  });
}

// ─── Storefront Mutations ───

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      storefrontApi.addToCart(productId, quantity),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.cart.list });
      void qc.invalidateQueries({ queryKey: keys.cart.count });
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartId, quantity }: { cartId: number; quantity: number }) =>
      storefrontApi.updateCartItem(cartId, quantity),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.cart.list });
    },
  });
}

export function useDeleteCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartId: number) => storefrontApi.deleteCartItem(cartId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.cart.list });
      void qc.invalidateQueries({ queryKey: keys.cart.count });
    },
  });
}

export function useSelectAllCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (selected: boolean) => storefrontApi.selectAllCart(selected),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.cart.list });
    },
  });
}

export function useBatchSelectCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ selected, cartIds }: { selected: boolean; cartIds: number[] }) =>
      storefrontApi.batchSelectCart(selected, cartIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.cart.list });
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storefrontApi.createOrder,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.cart.list });
      void qc.invalidateQueries({ queryKey: keys.cart.count });
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => storefrontApi.cancelOrder(orderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => storefrontApi.confirmOrder(orderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePayByPaymentNo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentNo: string) => storefrontApi.payByPaymentNo(paymentNo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["payments"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => storefrontApi.toggleFavorite(productId),
    onSuccess: (_data, productId) => {
      void qc.invalidateQueries({ queryKey: keys.favorites.check(productId) });
      void qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => storefrontApi.removeFavorite(productId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useReceiveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: number) => storefrontApi.receiveCoupon(templateId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.coupons.templates });
      void qc.invalidateQueries({ queryKey: ["coupons", "mine"] });
      void qc.invalidateQueries({ queryKey: ["coupons", "available"] });
    },
  });
}

export function useCalculateCoupon() {
  return useMutation({
    mutationFn: ({
      userCouponId,
      orderAmount,
    }: {
      userCouponId: number;
      orderAmount: number;
    }) => storefrontApi.calculateCoupon(userCouponId, orderAmount),
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storefrontApi.createComment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comments"] });
      void qc.invalidateQueries({ queryKey: ["products", "detail"] });
    },
  });
}

export function useDeleteMyComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => storefrontApi.deleteMyComment(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comments"] });
      void qc.invalidateQueries({ queryKey: ["products", "detail"] });
    },
  });
}

export function useDoSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => storefrontApi.doSignIn(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.signin.status });
      void qc.invalidateQueries({ queryKey: keys.user.profile });
    },
  });
}

export function useExchangePointsProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storefrontApi.exchangePointsProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.points.products });
      void qc.invalidateQueries({ queryKey: ["points", "records"] });
      void qc.invalidateQueries({ queryKey: keys.user.profile });
      void qc.invalidateQueries({ queryKey: keys.signin.status });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateCurrentUser,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.user.profile });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: authApi.updatePassword,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}

// ─── Admin Queries ───

export function useAdminProducts(params: AdminProductQuery) {
  return useQuery({
    queryKey: keys.admin.products(params),
    queryFn: () => adminApi.getProducts(params),
  });
}

export function useAdminProductDetail(id: number) {
  return useQuery({
    queryKey: keys.admin.productDetail(id),
    queryFn: () => adminApi.getProductById(id),
    enabled: id > 0,
  });
}

export function useAdminCategories(params: CategoryQuery) {
  return useQuery({
    queryKey: keys.admin.categories(params),
    queryFn: () => adminApi.getCategories(params),
  });
}

export function useAdminOrders(params: AdminOrderQuery) {
  return useQuery({
    queryKey: keys.admin.orders(params),
    queryFn: () => adminApi.getOrders(params),
  });
}

export function useAdminOrderDetail(id: number) {
  return useQuery({
    queryKey: keys.admin.orderDetail(id),
    queryFn: () => adminApi.getOrderById(id),
    enabled: id > 0,
  });
}

export function useAdminUsers(params: UserQuery) {
  return useQuery({
    queryKey: keys.admin.users(params),
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useAdminUserDetail(id: number) {
  return useQuery({
    queryKey: keys.admin.userDetail(id),
    queryFn: () => adminApi.getUserById(id),
    enabled: id > 0,
  });
}

export function useAdminCoupons(params: CouponQuery) {
  return useQuery({
    queryKey: keys.admin.coupons(params),
    queryFn: () => adminApi.getCoupons(params),
  });
}

export function useAdminCouponDetail(id: number) {
  return useQuery({
    queryKey: keys.admin.couponDetail(id),
    queryFn: () => adminApi.getCouponById(id),
    enabled: id > 0,
  });
}

export function useAdminCouponUsageLogs(params: UsageLogQuery) {
  return useQuery({
    queryKey: keys.admin.couponUsageLogs(params),
    queryFn: () => adminApi.getCouponUsageLogs(params),
  });
}

export function useAdminCouponStatistics() {
  return useQuery({
    queryKey: keys.admin.couponStatistics,
    queryFn: () => adminApi.getCouponStatistics(),
  });
}

export function useAdminComments(params: CommentQuery) {
  return useQuery({
    queryKey: keys.admin.comments(params),
    queryFn: () => adminApi.getComments(params),
  });
}

export function useAdminMemberLevels() {
  return useQuery({
    queryKey: keys.admin.memberLevels,
    queryFn: () => adminApi.getMemberLevels(),
  });
}

export function useAdminPointsProducts(params: PointsProductQuery) {
  return useQuery({
    queryKey: keys.admin.pointsProducts(params),
    queryFn: () => adminApi.getPointsProducts(params),
  });
}

// ─── Admin Mutations ───

function useAdminMutation<TArgs extends unknown[]>(
  mutationFn: (...args: TArgs) => Promise<unknown>,
  invalidateKeys: string[][],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mutationFn as () => Promise<unknown>,
    onSuccess: () => {
      for (const key of invalidateKeys) {
        void qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function useAdminCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof adminApi.updateProduct>[1] }) =>
      adminApi.updateProduct(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminUpdateProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updateProductStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminUpdateProductStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      adminApi.updateProductStock(id, stock),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      void qc.invalidateQueries({ queryKey: keys.categories.tree });
    },
  });
}

export function useAdminUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof adminApi.updateCategory>[1] }) =>
      adminApi.updateCategory(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      void qc.invalidateQueries({ queryKey: keys.categories.tree });
    },
  });
}

export function useAdminUpdateCategoryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updateCategoryStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      void qc.invalidateQueries({ queryKey: keys.categories.tree });
    },
  });
}

export function useAdminDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      void qc.invalidateQueries({ queryKey: keys.categories.tree });
    },
  });
}

export function useAdminUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useAdminCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.cancelOrder(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useAdminUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
      void qc.invalidateQueries({ queryKey: keys.user.profile });
    },
  });
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: number }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
      void qc.invalidateQueries({ queryKey: keys.user.profile });
    },
  });
}

export function useAdminUpdateUserPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, points }: { id: number; points: number }) =>
      adminApi.updateUserPoints(id, points),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
      void qc.invalidateQueries({ queryKey: keys.user.profile });
      void qc.invalidateQueries({ queryKey: ["points", "records"] });
      void qc.invalidateQueries({ queryKey: keys.signin.status });
    },
  });
}

export function useAdminCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createCoupon,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      void qc.invalidateQueries({ queryKey: keys.coupons.templates });
      void qc.invalidateQueries({ queryKey: keys.admin.couponStatistics });
    },
  });
}

export function useAdminUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateCoupon,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      void qc.invalidateQueries({ queryKey: keys.coupons.templates });
      void qc.invalidateQueries({ queryKey: keys.admin.couponStatistics });
    },
  });
}

export function useAdminUpdateCouponStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updateCouponStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      void qc.invalidateQueries({ queryKey: keys.coupons.templates });
    },
  });
}

export function useAdminDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      void qc.invalidateQueries({ queryKey: keys.coupons.templates });
      void qc.invalidateQueries({ queryKey: keys.admin.couponStatistics });
    },
  });
}

export function useAdminApproveComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.approveComment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "comments"] });
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useAdminRejectComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.rejectComment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "comments"] });
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useAdminReplyComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) =>
      adminApi.replyComment(id, reply),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "comments"] });
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useAdminDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteComment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "comments"] });
      void qc.invalidateQueries({ queryKey: ["comments"] });
      void qc.invalidateQueries({ queryKey: ["products", "detail"] });
    },
  });
}

export function useAdminCreateMemberLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createMemberLevel,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.admin.memberLevels });
    },
  });
}

export function useAdminUpdateMemberLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof adminApi.updateMemberLevel>[1] }) =>
      adminApi.updateMemberLevel(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.admin.memberLevels });
    },
  });
}

export function useAdminUpdateMemberLevelStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updateMemberLevelStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.admin.memberLevels });
    },
  });
}

export function useAdminDeleteMemberLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteMemberLevel(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.admin.memberLevels });
    },
  });
}

export function useAdminCreatePointsProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createPointsProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "pointsProducts"] });
    },
  });
}

export function useAdminUpdatePointsProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof adminApi.updatePointsProduct>[1] }) =>
      adminApi.updatePointsProduct(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "pointsProducts"] });
    },
  });
}

export function useAdminUpdatePointsProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) =>
      adminApi.updatePointsProductStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "pointsProducts"] });
    },
  });
}

export function useAdminDeletePointsProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deletePointsProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "pointsProducts"] });
    },
  });
}
