import { paymentApi } from "@/lib/api";
import { ApiError } from "@/lib/http";
import type { PaymentProviderMeta } from "@/lib/types";

const providerList: PaymentProviderMeta[] = [
  {
    id: "MOCK",
    label: "模拟支付",
    description: "用于本地联调和完整订单流程验证。",
    region: "development",
    executionMode: "mock",
    available: true,
    badge: "开发联调",
  },
  {
    id: "ALIPAY",
    label: "支付宝",
    description: "面向国内用户的主流扫码或跳转支付渠道。",
    region: "domestic",
    executionMode: "redirect",
    available: false,
    unavailableReason: "后端尚未接入支付宝发起和回调能力。",
    badge: "国内",
  },
  {
    id: "WECHAT",
    label: "微信支付",
    description: "支持微信内或扫码支付的国内渠道。",
    region: "domestic",
    executionMode: "qr",
    available: false,
    unavailableReason: "后端尚未接入微信支付统一下单能力。",
    badge: "国内",
  },
  {
    id: "UNIONPAY",
    label: "银联 / 云闪付",
    description: "银行卡和云闪付场景的国内渠道。",
    region: "domestic",
    executionMode: "redirect",
    available: false,
    unavailableReason: "缺少后端银联渠道对接和回调校验。",
    badge: "国内",
  },
  {
    id: "STRIPE",
    label: "Stripe",
    description: "支持国际信用卡和钱包聚合的支付服务。",
    region: "international",
    executionMode: "wallet-sheet",
    available: false,
    unavailableReason: "后端尚未提供 Stripe session / intent 发起能力。",
    badge: "国际",
  },
  {
    id: "PAYPAL",
    label: "PayPal",
    description: "国际站常见的 PayPal 跳转支付。",
    region: "international",
    executionMode: "redirect",
    available: false,
    unavailableReason: "后端尚未提供 PayPal order 创建与回调。",
    badge: "国际",
  },
  {
    id: "APPLE_PAY",
    label: "Apple Pay",
    description: "需要钱包令牌和兼容服务商的快捷支付。",
    region: "international",
    executionMode: "wallet-sheet",
    available: false,
    unavailableReason: "缺少钱包令牌下发和服务商适配。",
    badge: "钱包",
  },
  {
    id: "GOOGLE_PAY",
    label: "Google Pay",
    description: "国际 Android 钱包支付能力。",
    region: "international",
    executionMode: "wallet-sheet",
    available: false,
    unavailableReason: "缺少 Google Pay 网关和后端令牌协商。",
    badge: "钱包",
  },
];

export function getPaymentProviders() {
  return providerList;
}

export async function executePayment(paymentNo: string, providerId: PaymentProviderMeta["id"]) {
  const provider = providerList.find((item) => item.id === providerId);

  if (!provider) {
    throw new ApiError("未知支付渠道");
  }

  if (!provider.available) {
    throw new ApiError(provider.unavailableReason || "该支付方式暂不可用");
  }

  if (provider.executionMode === "mock") {
    return paymentApi.payByPaymentNo(paymentNo);
  }

  throw new ApiError("当前版本仅开放模拟支付执行流程");
}
