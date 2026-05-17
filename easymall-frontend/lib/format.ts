import type { PaymentProviderId } from "@/lib/types";

export const orderStatusMap: Record<number, string> = {
  0: "待支付",
  1: "已支付",
  2: "已发货",
  3: "已完成",
  4: "已取消",
  5: "待发货",
  6: "退款中",
  7: "已退款",
};

export const paymentStatusMap: Record<string, string> = {
  WAITING_PAY: "待支付",
  PAYING: "支付中",
  PAID: "已支付",
  CLOSED: "已关闭",
  FAILED: "支付失败",
};

export const paymentChannelMap: Record<PaymentProviderId, string> = {
  MOCK: "模拟支付",
  ALIPAY: "支付宝",
  WECHAT: "微信支付",
  UNIONPAY: "银联 / 云闪付",
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
};

export function formatCurrency(value: number | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace("T", " ").slice(0, 19);
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDate(value: string | null | undefined) {
  return formatDateTime(value).slice(0, 10);
}

export function getOrderStatusLabel(status: number) {
  return orderStatusMap[status] || "未知状态";
}

export function getPaymentStatusLabel(status: string) {
  return paymentStatusMap[status] || status;
}

export function getPaymentChannelLabel(channel: string) {
  return paymentChannelMap[channel as PaymentProviderId] || channel || "-";
}

export function getStatusTone(
  status: number | string,
): "success" | "warning" | "danger" | "neutral" | "info" {
  if (status === 1 || status === "PAID" || status === "COMPLETED") {
    return "success";
  }

  if (status === 0 || status === "WAITING_PAY" || status === 5) {
    return "warning";
  }

  if (status === 4 || status === 7 || status === "FAILED" || status === "CLOSED") {
    return "danger";
  }

  if (status === 2 || status === "PAYING") {
    return "info";
  }

  return "neutral";
}
