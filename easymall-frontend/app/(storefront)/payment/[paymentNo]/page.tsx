"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CircleCheckBig,
  CreditCard,
  QrCode,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { usePayByPaymentNo, usePaymentByNo } from "@/lib/hooks";
import { executePayment, getPaymentProviders } from "@/lib/payment-providers";
import { formatCurrency, formatDateTime, getPaymentStatusLabel } from "@/lib/format";
import type { PaymentProviderMeta } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] bg-[#f6f7fb] px-4 py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function ProviderModeIcon({ mode }: { mode: PaymentProviderMeta["executionMode"] }) {
  if (mode === "qr") return <QrCode className="h-5 w-5 text-muted" />;
  if (mode === "wallet-sheet") return <WalletCards className="h-5 w-5 text-muted" />;
  return <CreditCard className="h-5 w-5 text-muted" />;
}

export default function PaymentPage() {
  const params = useParams<{ paymentNo: string }>();
  const router = useRouter();
  const paymentNo = params.paymentNo;

  const { data: payment, isLoading } = usePaymentByNo(paymentNo);
  const payMutation = usePayByPaymentNo();

  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderMeta["id"]>("MOCK");
  const [statusMessage, setStatusMessage] = useState("");

  const providers = useMemo(() => getPaymentProviders(), []);
  const provider = providers.find((item) => item.id === selectedProvider) || providers[0];

  async function handlePay() {
    if (!payment) return;
    setStatusMessage("");

    try {
      await executePayment(payment.paymentNo, selectedProvider);
      payMutation.reset();
      setStatusMessage("模拟支付执行成功，订单状态已完成回流。");
      toast.success("支付成功");
    } catch (error) {
      const message = error instanceof Error ? error.message : "支付失败";
      setStatusMessage(message);
      toast.error(message);
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth>
        <LoadingState label="正在加载支付单..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      {payment ? (
        payment.status === "PAID" ? (
          <div className="mx-auto max-w-2xl store-section p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CircleCheckBig className="h-10 w-10" />
            </div>
            <h1 className="mt-5 text-[2rem] font-bold text-ink">支付成功</h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              订单 {payment.orderNo} 已完成支付，可以继续查看订单状态或返回商城继续购物。
            </p>
            <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
              <DetailRow label="支付单号" value={payment.paymentNo} />
              <DetailRow label="支付金额" value={formatCurrency(payment.amount)} />
              <DetailRow label="支付状态" value={getPaymentStatusLabel(payment.status)} />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full px-6" onClick={() => router.push(`/orders/${payment.orderId}`)}>
                查看订单
              </Button>
              <Button className="rounded-full px-6" onClick={() => router.push("/")} variant="secondary">
                返回商城
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="store-section overflow-hidden p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-end">
                <div>
                  <div className="store-kicker">
                    <CreditCard className="h-4 w-4" />
                    支付中心
                  </div>
                  <h1 className="mt-2 text-[2rem] font-bold text-ink">为订单选择支付方式，并把状态回流到订单页</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                    当前版本优先打通完整的支付链路体验，模拟支付可直接完成本地联调，其余渠道展示后续接入规划。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="store-pill bg-[#fff7f2]">模拟支付可直接联调</span>
                    <span className="store-pill bg-[#fff7f2]">订单状态自动同步</span>
                    <span className="store-pill bg-[#fff7f2]">支持展示多渠道扩展位</span>
                  </div>
                </div>
                <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
                  <div className="text-sm font-semibold text-white/78">待支付金额</div>
                  <div className="mt-3 text-4xl font-extrabold">{formatCurrency(payment.amount)}</div>
                  <div className="mt-2 text-sm text-white/78">订单号：{payment.orderNo}</div>
                  <div className="mt-4 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm text-white/82">
                    {getPaymentStatusLabel(payment.status)}
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="store-section p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-ink">选择支付方式</div>
                    <p className="mt-1 text-sm text-muted">选择渠道后即可发起支付动作。</p>
                  </div>
                  <Badge tone="warning" className="rounded-full px-3 py-1">
                    {getPaymentStatusLabel(payment.status)}
                  </Badge>
                </div>

                <div className="mt-5 space-y-3">
                  {providers.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full rounded-[24px] border p-4 text-left transition ${
                        selectedProvider === item.id
                          ? "border-accent bg-accent-light"
                          : "border-border bg-white hover:border-accent/40"
                      }`}
                      onClick={() => setSelectedProvider(item.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-ink">{item.label}</span>
                            <Badge tone={item.available ? "success" : "neutral"}>{item.badge}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                          {!item.available && item.unavailableReason ? (
                            <p className="mt-2 text-xs text-muted">{item.unavailableReason}</p>
                          ) : null}
                        </div>
                        <ProviderModeIcon mode={item.executionMode} />
                      </div>
                    </button>
                  ))}
                </div>

                {statusMessage ? (
                  <div className="mt-4 rounded-[20px] bg-[#f6f7fb] px-4 py-3 text-sm text-ink">
                    {statusMessage}
                  </div>
                ) : null}
              </section>

              <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
                <section className="store-section p-5">
                  <div className="text-base font-semibold text-ink">支付信息</div>
                  <div className="mt-4 space-y-3">
                    <DetailRow label="订单号" value={payment.orderNo} />
                    <DetailRow label="支付单号" value={payment.paymentNo} />
                    <DetailRow label="创建时间" value={formatDateTime(payment.createTime)} />
                    <DetailRow label="当前状态" value={getPaymentStatusLabel(payment.status)} />
                  </div>
                  <Button
                    className="mt-5 h-12 w-full rounded-full"
                    disabled={!provider.available || payMutation.isPending}
                    onClick={() => void handlePay()}
                  >
                    {payMutation.isPending ? "支付处理中..." : `使用 ${provider.label} 支付`}
                  </Button>
                  <Button
                    className="mt-3 h-12 w-full rounded-full"
                    onClick={() => router.push(`/orders/${payment.orderId}`)}
                    variant="secondary"
                  >
                    查看订单详情
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </section>

                <section className="store-section p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    支付说明
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                    <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                      当前开放模拟支付，用于完整验证“下单 → 支付 → 订单回流”的交互链路。
                    </div>
                    <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                      其他渠道保留扩展位，后续只需补齐后端发起与回调能力即可接入。
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )
      ) : (
        <EmptyState
          title="支付单不存在"
          description="请检查支付链接是否正确，或返回订单页重新发起支付。"
          action={{ label: "返回我的订单", onClick: () => router.push("/orders") }}
        />
      )}
    </ProtectedRoute>
  );
}
