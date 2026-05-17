"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useOrderDetail, useCancelOrder, useConfirmOrder } from "@/lib/hooks";
import { storefrontApi } from "@/lib/api";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getStatusTone } from "@/lib/format";

function Detail({
  label,
  value,
  full = false,
  highlight = false,
}: {
  label: string;
  value: string;
  full?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={`mt-2 ${highlight ? "text-2xl font-black text-rose-600" : "text-sm font-semibold text-slate-900"}`}>
        {value}
      </div>
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
        <div className="space-y-5">
          <Card className="rounded-[34px]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Button variant="ghost" onClick={() => router.push("/orders")}>
                  返回订单列表
                </Button>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  订单详情
                </h1>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  订单号：{order.orderNo}
                </p>
              </div>
              <Badge tone={getStatusTone(order.status)}>
                {order.statusText || getOrderStatusLabel(order.status)}
              </Badge>
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <Card className="rounded-[30px]">
                <h2 className="text-xl font-black">商品清单</h2>
                <div className="mt-5 space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-[24px] border border-[var(--border)] p-4">
                      <div className="h-20 w-20 overflow-hidden rounded-[20px] bg-slate-100">
                        <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-950">{item.productName}</div>
                        <div className="mt-2 text-sm text-slate-500">
                          {formatCurrency(item.productPrice || 0)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-rose-600">
                          {formatCurrency(item.totalPrice || 0)}
                        </div>
                        {order.status === 3 ? (
                          <button
                            className="mt-3 text-sm font-semibold text-emerald-700"
                            onClick={() => toast.info("评论入口已保留，可继续增强为完整评价流程")}
                            type="button"
                          >
                            去评价
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[30px]">
                <h2 className="text-xl font-black">收货信息</h2>
                <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                  <Detail label="收货人" value={order.receiverName || "-"} />
                  <Detail label="联系电话" value={order.receiverPhone || "-"} />
                  <Detail label="收货地址" value={order.receiverAddress || "-"} full />
                  <Detail label="备注" value={order.remark || "无"} full />
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="rounded-[30px]">
                <h2 className="text-xl font-black">订单状态</h2>
                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <Detail label="下单时间" value={formatDateTime(order.createTime)} />
                  <Detail label="支付时间" value={order.payTime ? formatDateTime(order.payTime) : "-"} />
                  <Detail label="订单状态" value={order.statusText || getOrderStatusLabel(order.status)} />
                </div>
              </Card>

              <Card className="rounded-[30px]">
                <h2 className="text-xl font-black">金额汇总</h2>
                <div className="mt-5 space-y-4">
                  <Detail label="商品总额" value={formatCurrency(order.totalAmount)} />
                  <Detail label="实付金额" value={formatCurrency(order.payAmount)} highlight />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  {order.status === 0 ? (
                    <>
                      <Button onClick={() => void handlePay()}>去支付</Button>
                      <Button variant="secondary" onClick={() => void handleCancel()}>
                        取消订单
                      </Button>
                    </>
                  ) : null}
                  {order.status === 2 ? (
                    <Button onClick={() => void handleConfirm()}>确认收货</Button>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="订单不存在"
          description="当前订单可能已经被删除，或者访问链接无效。"
          action={{
            label: "返回订单列表",
            onClick: () => router.push("/orders"),
          }}
        />
      )}
    </ProtectedRoute>
  );
}
