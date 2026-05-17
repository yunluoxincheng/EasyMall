export interface ErrorDetail {
  field: string;
  code: string;
  message: string;
  rejectedValue: unknown;
}

export interface Result<T> {
  success: boolean;
  code: string;
  message: string;
  timestamp: string;
  traceId: string;
  data: T;
  errors?: ErrorDetail[];
}

export interface PageResult<T> {
  total: number;
  records: T[];
  pageNum: number;
  pageSize: number;
  pages: number;
}

export interface MyBatisPage<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ListPage<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

export interface UserVO {
  id: number;
  username: string;
  nickname: string;
  phone: string;
  email: string;
  avatar: string;
  gender: number;
  role: number;
  status: number;
  points: number;
  level: number;
  createTime: string;
}

export interface LoginVO {
  token: string;
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  role: number;
}

export interface UserRegisterDTO {
  username: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  email?: string;
}

export interface UserUpdateDTO {
  nickname?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: number;
}

export interface PasswordUpdateDTO {
  oldPassword: string;
  newPassword: string;
}

export interface SessionUser {
  id: number;
  username: string;
  nickname: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: number;
  role: number;
  points?: number;
  level?: number;
}

export interface SessionState {
  token: string;
  user: SessionUser | null;
}

export interface ProductVO {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  originalPrice: number;
  price: number;
  stock: number;
  sales: number;
  image: string;
  images: string[];
  categoryId: number;
  categoryName: string;
  brand: string;
  status: number;
  createTime: string;
}

export interface ProductQuery {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
}

export interface CategoryVO {
  id: number;
  name: string;
  icon: string;
  parentId: number;
  level: number;
  sort: number;
  status: number;
  createTime: string;
  children?: CategoryVO[];
}

export interface CartVO {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  selected: boolean;
  stock: number;
  createTime: string;
}

export interface OrderItemVO {
  id: number;
  orderId?: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice?: number;
  price?: number;
  quantity: number;
  totalPrice?: number;
  subtotal?: number;
  createTime?: string;
}

export interface OrderVO {
  id: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  payAmount: number;
  status: number;
  statusText: string;
  paymentMethod: string;
  payTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  remark: string;
  createTime: string;
  orderItems: OrderItemVO[];
}

export interface OrderCreateDTO {
  cartIds: number[];
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  remark?: string;
  userCouponId?: number;
}

export interface OrderCreateVO {
  orderNo: string;
  paymentNo: string;
}

export interface OrderQuery {
  pageNum?: number;
  pageSize?: number;
  status?: number;
}

export interface PaymentVO {
  id: number;
  paymentNo: string;
  orderId: number;
  orderNo: string;
  amount: number;
  channel: string;
  status: string;
  statusText: string;
  thirdTradeNo: string;
  paidTime: string;
  createTime: string;
}

export interface UserCouponVO {
  id: number;
  templateId: number;
  couponCode: string;
  couponName: string;
  type: number;
  typeDesc: string;
  discountAmount: number;
  discountPercentage: number;
  minAmount: number;
  maxDiscount: number;
  startTime: string;
  endTime: string;
  status: number;
  statusDesc: string;
  useTime: string;
  orderId: number;
  orderNo: string;
  receiveTime: string;
  expiringSoon: boolean;
}

export interface CouponCalculateResultVO {
  userCouponId: number;
  couponName: string;
  type: number;
  typeDesc: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  available: boolean;
  unavailableReason: string;
}

export interface PointsRecordVO {
  id: number;
  pointsChange: number;
  beforePoints: number;
  afterPoints: number;
  type: number;
  typeDesc: string;
  bizType: string;
  bizId: string;
  sourceId: number;
  description: string;
  createTime: string;
}

export interface PointsProductVO {
  id: number;
  name: string;
  description: string;
  image: string;
  pointsRequired: number;
  stock: number;
  exchangeCount: number;
  status: number;
  canExchange: boolean;
  createTime: string;
}

export interface PointsExchangeVO {
  id: number;
  exchangeNo: string;
  productId: number;
  productName: string;
  pointsUsed: number;
  status: number;
  statusText: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  remark: string;
  createTime: string;
}

export interface MemberLevelVO {
  level: number;
  levelName: string;
  minPoints: number;
  maxPoints: number;
  discount: number;
  icon: string;
  benefits: string;
  currentPoints: number;
  pointsToNextLevel: number;
  isCurrentLevel: boolean;
}

export interface SignInResultVO {
  success: boolean;
  message: string;
  pointsEarned: number;
  continuousDays: number;
  currentPoints: number;
  hasSignedToday: boolean;
}

export interface FavoriteVO {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productStock: number;
  createTime: string;
}

export interface UserCommentVO {
  id: number;
  userId: number;
  userNickname: string;
  userAvatar: string;
  productId: number;
  orderId: number;
  content: string;
  rating: number;
  images: string;
  reply: string;
  replyTime: string;
  createTime: string;
}

export interface CommentCreateDTO {
  productId: number;
  orderId: number;
  content: string;
  rating: number;
}

export interface ProductPageItem {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  stock: number;
  sales: number;
  image: string;
  categoryId: number;
  categoryName: string;
  status: number;
  createTime: string;
}

export interface ProductDetail extends ProductVO {
  updateTime: string;
}

export interface ProductFormData {
  name: string;
  subtitle: string;
  description: string;
  originalPrice: number | null;
  price: number | null;
  stock: number | null;
  image: string;
  images: string;
  categoryId: number | null;
  brand: string;
}

export interface AdminProductQuery {
  pageNum: number;
  pageSize: number;
  name?: string;
  categoryId?: number;
  status?: number;
}

export interface CategoryPageItem {
  id: number;
  name: string;
  icon: string;
  parentId: number;
  parentName: string;
  level: number;
  sort: number;
  status: number;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  parentId: number | null;
  level: number;
  sort: number;
  status: number;
}

export interface CategoryQuery {
  pageNum: number;
  pageSize: number;
  name?: string;
  parentId?: number;
  level?: number;
  status?: number;
}

export interface OrderPageItem {
  id: number;
  orderNo: string;
  userId: number;
  username: string;
  nickname: string;
  totalAmount: number;
  payAmount: number;
  status: number;
  paymentMethod: string;
  createTime: string;
}

export interface OrderDetailAdmin {
  id: number;
  orderNo: string;
  userId: number;
  username: string;
  nickname: string;
  phone: string;
  totalAmount: number;
  payAmount: number;
  status: number;
  paymentMethod: string;
  payTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  remark: string;
  createTime: string;
  updateTime: string;
  items: OrderItemVO[];
}

export interface AdminOrderQuery {
  pageNum: number;
  pageSize: number;
  orderNo?: string;
  status?: number;
}

export interface UserPageItem {
  id: number;
  username: string;
  nickname: string;
  phone: string;
  email: string;
  avatar: string;
  gender: number;
  role: number;
  status: number;
  points: number;
  level: number;
  createTime: string;
}

export interface UserQuery {
  pageNum: number;
  pageSize: number;
  username?: string;
  phone?: string;
  status?: number;
  role?: number;
}

export interface CouponTemplateVO {
  id: number;
  name: string;
  type: number;
  typeDesc: string;
  discountAmount: number;
  discountPercentage: number;
  minAmount: number;
  maxDiscount: number;
  totalCount: number;
  receivedCount: number;
  usedCount: number;
  remainingCount: number;
  receiveRate: number;
  usageRate: number;
  memberLevel: number;
  validDays: number;
  startTime: string;
  endTime: string;
  sortOrder: number;
  status: number;
  statusDesc: string;
  description: string;
}

export interface CouponTemplateDTO {
  id?: number;
  name: string;
  type: number | null;
  discountAmount: number | null;
  discountPercentage: number | null;
  minAmount: number | null;
  maxDiscount: number | null;
  totalCount: number | null;
  memberLevel: number;
  validDays: number;
  startTime: string;
  endTime: string;
  sortOrder: number;
  status: number;
  description: string;
}

export interface CouponQuery {
  pageNum: number;
  pageSize: number;
  name?: string;
  type?: number;
  status?: number;
}

export interface CouponUsageLogVO {
  id: number;
  userId: number;
  userCouponId: number;
  templateId: number;
  couponName: string;
  couponType: number;
  couponTypeDesc: string;
  orderId: number;
  orderNo: string;
  orderAmount: number;
  discountAmount: number;
  action: number;
  actionDesc: string;
  createTime: string;
}

export interface UsageLogQuery {
  templateId?: number;
  userId?: number;
  pageNum: number;
  pageSize: number;
}

export type CouponStatistics = Record<string, unknown>;

export interface CommentPageItem {
  id: number;
  userId: number;
  username: string;
  nickname: string;
  productId: number;
  productName: string;
  content: string;
  rating: number;
  showStatus: number;
  reply: string;
  createTime: string;
}

export interface CommentQuery {
  pageNum: number;
  pageSize: number;
  productId?: number;
  userId?: number;
  showStatus?: number;
  rating?: number;
}

export interface MemberLevelItem {
  id: number;
  level: number;
  levelName: string;
  minPoints: number;
  maxPoints: number;
  discount: number;
  icon: string;
  benefits: string;
  sortOrder: number;
  status: number;
  createTime: string;
}

export interface MemberLevelFormData {
  level: number | null;
  levelName: string;
  minPoints: number | null;
  maxPoints: number | null;
  discount: number | null;
  icon: string;
  benefits: string;
  sortOrder: number;
}

export interface PointsProductPageItem {
  id: number;
  name: string;
  description: string;
  image: string;
  pointsRequired: number;
  stock: number;
  exchangeCount: number;
  sortOrder: number;
  status: number;
  createTime: string;
}

export interface PointsProductFormData {
  name: string;
  description: string;
  image: string;
  pointsRequired: number | null;
  stock: number | null;
  sortOrder: number;
}

export interface PointsProductQuery {
  pageNum: number;
  pageSize: number;
  name?: string;
  status?: number;
}

export type PaymentProviderId =
  | "MOCK"
  | "ALIPAY"
  | "WECHAT"
  | "UNIONPAY"
  | "STRIPE"
  | "PAYPAL"
  | "APPLE_PAY"
  | "GOOGLE_PAY";

export type PaymentExecutionMode = "mock" | "redirect" | "qr" | "wallet-sheet";

export interface PaymentProviderMeta {
  id: PaymentProviderId;
  label: string;
  description: string;
  region: "domestic" | "international" | "development";
  executionMode: PaymentExecutionMode;
  available: boolean;
  unavailableReason?: string;
  badge: string;
}
