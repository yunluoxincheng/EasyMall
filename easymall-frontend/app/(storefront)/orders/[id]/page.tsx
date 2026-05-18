"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  PackageSearch,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { storefrontApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCancelOrder, useConfirmOrder, useOrderDetail } from "@/lib/hooks";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getStatusTone,
} from "@/lib/format";

function Detail({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[22px] bg-[#f6f7fb] px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 ${highlight ? "text-lg font-extrabold text-accent" : "text-sm font-semibold text-ink"}`}>
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
    return (
      <ProtectedRoute requireAuth>
        <LoadingState label="正在加载订单详情..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      {order ? (
        <div className="space-y-5">
          <section className="store-section overflow-hidden p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:items-end">
              <div>
                <Button className="mb-4 rounded-full px-4" onClick={() => router.push("/orders")} variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回订单列表
                </Button>
                <div className="store-kicker">
                  <PackageSearch className="h-4 w-4" />
                  订单详情
                </div>
                <h1 className="mt-2 text-[2rem] font-bold text-ink">订单状态、商品明细和履约信息一次看清楚</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                  这里把订单号、状态、商品、收货信息和操作入口集中展示，避免用户还要在多个页面来回切换。
                </p>
              </div>
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
                <div className="text-sm font-semibold text-white/78">当前状态</div>
                <div className="mt-3 text-2xl font-extrabold">
                  {order.statusText || getOrderStatusLabel(order.status)}
                </div>
                <div className="mt-3 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm text-white/82">
                  订单号：{order.orderNo}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <section className="store-section p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-semibold text-ink">状态概览</div>
                  <Badge tone={getStatusTone(order.status)} className="rounded-full px-3 py-1">
                    {order.statusText || getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Detail label="下单时间" value={formatDateTime(order.createTime)} />
                  <Detail label="支付时间" value={order.payTime ? formatDateTime(order.payTime) : "-"} />
                  <Detail label="实付金额" value={formatCurrency(order.payAmount)} highlight />
                </div>
              </section>

              <section className="store-section p-5">
                <div className="text-base font-semibold text-ink">商品清单</div>
                <div className="mt-4 space-y-3">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-[24px] bg-[#fbfcfe] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[20px] bg-[#f6f7fb]">
                        <Image
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          fill
                          sizes="80px"
                          src={item.productImage || "/favicon.svg"}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink">{item.productName}</div>
                        <div className="mt-1 text-xs text-muted">
                          {formatCurrency(item.productPrice || 0)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted">小计</div>
                        <div className="mt-1 text-sm font-bold text-accent">
                          {formatCurrency(item.totalPrice || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-base font-semibold text-ink">
                  <MapPin className="h-4 w-4 text-accent" />
                  收货信息
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Detail label="收货人" value={order.receiverName || "-"} />
                  <Detail label="联系电话" value={order.receiverPhone || "-"} />
                  <div className="md:col-span-2">
                    <Detail label="收货地址" value={order.receiverAddress || "-"} />
                  </div>
                  <div className="md:col-span-2">
                    <Detail label="订单备注" value={order.remark || "无"} />
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <section className="store-section p-5">
                <div className="text-base font-semibold text-ink">金额汇总</div>
                <div className="mt-4 space-y-3">
                  <Detail label="商品总额" value={formatCurrency(order.totalAmount)} />
                  <Detail label="实付金额" value={formatCurrency(order.payAmount)} highlight />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {order.status === 0 ? (
                    <>
                      <Button className="rounded-full px-5" onClick={() => void handlePay()}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        去支付
                      </Button>
                      <Button className="rounded-full px-5" onClick={() => void handleCancel()} variant="secondary">
                        取消订单
                      </Button>
                    </>
                  ) : null}
                  {order.status === 2 ? (
                    <Button className="rounded-full px-5" onClick={() => void handleConfirm()}>
                      确认收货
                    </Button>
                  ) : null}
                </div>
              </section>

              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Truck className="h-4 w-4 text-accent" />
                  履约提醒
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    待支付订单可继续进入支付页，完成后状态会同步回流。
                  </div>
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    已发货订单可在确认收到商品后手动确认收货。
                  </div>
                </div>
              </section>

              <section className="store-section p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  服务承诺
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
                    订单路径清晰可追踪，适合继续补充退款、售后与物流轨迹能力。
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      ) : (
        <EmptyState
          title="订单不存在"
          description="该订单可能已被删除，或者链接地址无效。"
          action={{ label: "返回订单列表", onClick: () => router.push("/orders") }}
        />
      )}
    </ProtectedRoute>
  );
}
