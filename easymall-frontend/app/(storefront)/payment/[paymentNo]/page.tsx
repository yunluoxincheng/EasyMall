"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CircleCheckBig, CreditCard, QrCode, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { usePaymentByNo, usePayByPaymentNo } from "@/lib/hooks";
import { executePayment, getPaymentProviders } from "@/lib/payment-providers";
import { formatCurrency, formatDateTime, getPaymentStatusLabel } from "@/lib/format";
import type { PaymentProviderMeta } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
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
      setStatusMessage("模拟支付执行成功");
      toast.success("支付成功");
    } catch (error) {
      const message = error instanceof Error ? error.message : "支付失败";
      setStatusMessage(message);
      toast.error(message);
    }
  }

  if (isLoading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载支付单..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      {payment ? (
        payment.status === "PAID" ? (
          <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CircleCheckBig className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-ink">支付成功</h1>
            <p className="mt-2 text-sm text-muted">
              订单号 {payment.orderNo} 已支付完成
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => router.push(`/orders/${payment.orderId}`)}>查看订单</Button>
              <Button variant="secondary" onClick={() => router.push("/")}>返回商城</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
            <div className="rounded-lg bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-ink">选择支付方式</h1>
                  <p className="text-xs text-muted">选择渠道后完成支付</p>
                </div>
                <Badge tone="warning">{getPaymentStatusLabel(payment.status)}</Badge>
              </div>

              <div className="mt-4 space-y-2">
                {providers.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedProvider === item.id
                        ? "border-accent bg-accent-light"
                        : "border-border hover:border-accent/40"
                    }`}
                    onClick={() => setSelectedProvider(item.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{item.label}</span>
                          <Badge tone={item.available ? "success" : "neutral"}>{item.badge}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted">{item.description}</p>
                      </div>
                      <ProviderModeIcon mode={item.executionMode} />
                    </div>
                  </button>
                ))}
              </div>

              {statusMessage && (
                <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-ink">{statusMessage}</div>
              )}
            </div>

            <div className="rounded-lg bg-white p-4 shadow-card">
              <div className="text-xs text-muted">支付金额</div>
              <div className="mt-1 text-2xl font-bold text-accent">{formatCurrency(payment.amount)}</div>
              <div className="mt-4 space-y-2">
                <DetailRow label="订单号" value={payment.orderNo} />
                <DetailRow label="支付单号" value={payment.paymentNo} />
                <DetailRow label="创建时间" value={formatDateTime(payment.createTime)} />
                <DetailRow label="当前状态" value={getPaymentStatusLabel(payment.status)} />
              </div>
              <div className="mt-4 space-y-2">
                <Button disabled={!provider.available || payMutation.isPending} className="w-full" onClick={handlePay}>
                  {payMutation.isPending ? "支付处理中..." : `使用 ${provider.label} 支付`}
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => router.push(`/orders/${payment.orderId}`)}>
                  查看订单详情 <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )
      ) : (
        <EmptyState
          title="支付单不存在"
          description="请检查支付链接是否正确"
          action={{ label: "返回我的订单", onClick: () => router.push("/orders") }}
        />
      )}
    </ProtectedRoute>
  );
}
