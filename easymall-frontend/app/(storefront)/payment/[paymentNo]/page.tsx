"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CircleCheckBig, CreditCard, QrCode, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { executePayment, getPaymentProviders } from "@/lib/payment-providers";
import { formatCurrency, formatDateTime, getPaymentStatusLabel } from "@/lib/format";
import type { PaymentProviderMeta, PaymentVO } from "@/lib/types";
import { storefrontApi } from "@/lib/api";

export default function PaymentPage() {
  const params = useParams<{ paymentNo: string }>();
  const router = useRouter();
  const paymentNo = params.paymentNo;

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState<PaymentVO | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderMeta["id"]>("MOCK");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const data = await storefrontApi.getPaymentByPaymentNo(paymentNo);
        if (!cancelled) {
          setPayment(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "获取支付单失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [paymentNo]);

  const providers = useMemo(() => getPaymentProviders(), []);
  const provider = providers.find((item) => item.id === selectedProvider) || providers[0];

  async function handlePay() {
    if (!payment) {
      return;
    }

    setPaying(true);
    setStatusMessage("");
    try {
      const paid = await executePayment(payment.paymentNo, selectedProvider);
      setPayment(paid);
      setStatusMessage("模拟支付执行成功，订单流程可以继续向下验证。");
      toast.success("支付成功");
    } catch (error) {
      const message = error instanceof Error ? error.message : "支付失败";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载支付单..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      {payment ? (
        payment.status === "PAID" ? (
          <Card className="mx-auto max-w-3xl rounded-[36px] text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CircleCheckBig className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950">支付成功</h1>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              订单号 {payment.orderNo} 已支付完成。你可以立即查看订单状态，或者返回商城继续浏览商品。
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button onClick={() => router.push(`/orders/${payment.orderId}`)}>查看订单</Button>
              <Button variant="secondary" onClick={() => router.push("/")}>
                返回商城
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="rounded-[34px]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Payment
                  </p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    选择支付方式
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    第一版保留 mock 支付完整可执行，真实渠道按配置和后端能力展示可用状态，
                    未配置时会明确标记为不可发起。
                  </p>
                </div>
                <Badge tone="warning">{getPaymentStatusLabel(payment.status)}</Badge>
              </div>

              <div className="mt-6 space-y-4">
                {providers.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full rounded-[28px] border p-5 text-left transition ${
                      selectedProvider === item.id
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-[var(--border)] bg-white hover:border-emerald-200"
                    }`}
                    onClick={() => setSelectedProvider(item.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black">{item.label}</span>
                          <Badge tone={item.available ? "success" : "neutral"}>
                            {item.badge}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                          {item.description}
                        </p>
                        {!item.available ? (
                          <p className="mt-3 text-sm font-semibold text-amber-700">
                            {item.unavailableReason}
                          </p>
                        ) : null}
                      </div>
                      <ProviderModeIcon mode={item.executionMode} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-900">
                  当前渠道说明：{provider.label}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {provider.available
                    ? `该渠道当前使用 ${provider.executionMode} 适配边界。mock 渠道会直接调用支付完成接口。`
                    : provider.unavailableReason}
                </p>
                {statusMessage ? (
                  <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    {statusMessage}
                  </p>
                ) : null}
              </div>
            </Card>

            <Card className="rounded-[34px]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Payment Sheet
              </div>
              <div className="mt-3 text-4xl font-black text-rose-600">
                {formatCurrency(payment.amount)}
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <DetailRow label="订单号" value={payment.orderNo} />
                <DetailRow label="支付单号" value={payment.paymentNo} />
                <DetailRow label="创建时间" value={formatDateTime(payment.createTime)} />
                <DetailRow label="当前状态" value={getPaymentStatusLabel(payment.status)} />
              </div>
              <div className="mt-6 space-y-3">
                <Button disabled={!provider.available || paying} className="w-full" onClick={handlePay}>
                  {paying ? "支付处理中..." : `使用 ${provider.label} 支付`}
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => router.push(`/orders/${payment.orderId}`)}>
                  查看订单详情
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )
      ) : (
        <EmptyState
          title="支付单不存在"
          description="请检查支付链接是否正确，或者回到订单页重新进入支付流程。"
          action={{
            label: "返回我的订单",
            onClick: () => router.push("/orders"),
          }}
        />
      )}
    </ProtectedRoute>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ProviderModeIcon({ mode }: { mode: PaymentProviderMeta["executionMode"] }) {
  if (mode === "qr") {
    return <QrCode className="h-6 w-6 text-slate-400" />;
  }
  if (mode === "wallet-sheet") {
    return <WalletCards className="h-6 w-6 text-slate-400" />;
  }
  return <CreditCard className="h-6 w-6 text-slate-400" />;
}
