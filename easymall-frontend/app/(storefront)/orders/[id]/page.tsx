"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useOrderDetail, useCancelOrder, useConfirmOrder } from "@/lib/hooks";
import { storefrontApi } from "@/lib/api";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getStatusTone } from "@/lib/format";

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-0.5 ${highlight ? "text-xl font-bold text-accent" : "text-sm font-medium text-ink"}`}>{value}</div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data: order, isLoading } = useOrderDetail(orderId);
  const cancelOrder = useCancelOrder();
  const confirmOrder = useConfirmOrder();

  async function handleCancel() {
    if (!window.confirm("确定要取消该订单吗？")) return;
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success("订单已取消");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "取消订单失败");
    }
  }

  async function handleConfirm() {
    if (!window.confirm("确认已经收到商品吗？")) return;
    try {
      await confirmOrder.mutateAsync(orderId);
      toast.success("确认收货成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "确认收货失败");
    }
  }

  async function handlePay() {
    try {
      const payment = await storefrontApi.getOrderPayment(orderId);
      router.push(`/payment/${payment.paymentNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取支付信息失败");
    }
  }

  if (isLoading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载订单详情..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      {order ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-card">
            <div>
              <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-2">
                返回订单列表
              </Button>
              <h1 className="text-lg font-semibold text-ink">订单详情</h1>
              <p className="text-xs text-muted">订单号：{order.orderNo}</p>
            </div>
            <Badge tone={getStatusTone(order.status)}>
              {order.statusText || getOrderStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              <div className="rounded-lg bg-white p-4 shadow-card">
                <h2 className="text-sm font-semibold text-ink">商品清单</h2>
                <div className="mt-3 space-y-2">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-50">
                        <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink">{item.productName}</div>
                        <div className="text-xs text-muted">{formatCurrency(item.productPrice || 0)} × {item.quantity}</div>
                      </div>
                      <div className="text-sm font-bold text-accent">{formatCurrency(item.totalPrice || 0)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow-card">
                <h2 className="text-sm font-semibold text-ink">收货信息</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Detail label="收货人" value={order.receiverName || "-"} />
                  <Detail label="联系电话" value={order.receiverPhone || "-"} />
                  <div className="sm:col-span-2">
                    <Detail label="收货地址" value={order.receiverAddress || "-"} />
                  </div>
                  <div className="sm:col-span-2">
                    <Detail label="备注" value={order.remark || "无"} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-white p-4 shadow-card">
                <h2 className="text-sm font-semibold text-ink">订单状态</h2>
                <div className="mt-3 space-y-2">
                  <Detail label="下单时间" value={formatDateTime(order.createTime)} />
                  <Detail label="支付时间" value={order.payTime ? formatDateTime(order.payTime) : "-"} />
                  <Detail label="订单状态" value={order.statusText || getOrderStatusLabel(order.status)} />
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow-card">
                <h2 className="text-sm font-semibold text-ink">金额汇总</h2>
                <div className="mt-3 space-y-2">
                  <Detail label="商品总额" value={formatCurrency(order.totalAmount)} />
                  <Detail label="实付金额" value={formatCurrency(order.payAmount)} highlight />
                </div>
                <div className="mt-4 flex gap-2">
                  {order.status === 0 ? (
                    <>
                      <Button onClick={() => void handlePay()}>去支付</Button>
                      <Button variant="secondary" onClick={() => void handleCancel()}>取消订单</Button>
                    </>
                  ) : null}
                  {order.status === 2 ? (
                    <Button onClick={() => void handleConfirm()}>确认收货</Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="订单不存在"
          description="该订单可能已被删除或链接无效"
          action={{ label: "返回订单列表", onClick: () => router.push("/orders") }}
        />
      )}
    </ProtectedRoute>
  );
}
