"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, PackageCheck, ReceiptText, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { useOrders } from "@/lib/hooks";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusLabel,
  getStatusTone,
} from "@/lib/format";
import type { OrderVO } from "@/lib/types";

const tabs = [
  { label: "全部", value: "" },
  { label: "待支付", value: "0" },
  { label: "已支付", value: "1" },
  { label: "待发货", value: "5" },
  { label: "已发货", value: "2" },
  { label: "已完成", value: "3" },
  { label: "已取消", value: "4" },
];

function OrderCard({ order, onGoPay }: { order: OrderVO; onGoPay: (order: OrderVO) => void }) {
  const router = useRouter();

  return (
    <div className="store-section p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="text-sm font-semibold text-ink">订单号：{order.orderNo}</div>
            <div className="mt-1 text-xs text-muted">{formatDateTime(order.createTime)}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getStatusTone(order.status)} className="rounded-full px-3 py-1">
              {order.statusText || getOrderStatusLabel(order.status)}
            </Badge>
            <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-xs text-muted">
              {order.paymentMethod || "在线支付"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {order.orderItems.slice(0, 3).map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[22px] bg-[#fbfcfe] p-4 sm:flex-row sm:items-center">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-[#f6f7fb]">
                <Image
                  alt={item.productName}
                  className="h-full w-full object-cover"
                  fill
                  sizes="64px"
                  src={item.productImage || "/favicon.svg"}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-semibold text-ink">{item.productName}</div>
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

        <div className="flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <OrderMeta label="收货人" value={order.receiverName || "-"} />
            <OrderMeta label="支付状态" value={order.statusText || getOrderStatusLabel(order.status)} />
            <OrderMeta label="实付金额" value={formatCurrency(order.payAmount)} highlight />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-full px-5" onClick={() => router.push(`/orders/${order.id}`)} variant="secondary">
              查看详情
            </Button>
            {order.status === 0 ? (
              <Button className="rounded-full px-5" onClick={() => onGoPay(order)}>
                去支付
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderMeta({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[20px] bg-[#f6f7fb] px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 ${highlight ? "text-lg font-extrabold text-accent" : "text-sm font-semibold text-ink"}`}>
        {value}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);

  const { data: orderPage, isLoading } = useOrders({
    pageNum: page,
    pageSize: 8,
    status: activeTab ? Number(activeTab) : undefined,
  });

  const orders = orderPage?.records ?? [];
  const total = orderPage?.total ?? 0;
  const summary = useMemo(() => {
    const waitingPay = orders.filter((item) => item.status === 0).length;
    const delivering = orders.filter((item) => item.status === 2 || item.status === 5).length;
    const finished = orders.filter((item) => item.status === 3).length;
    return { waitingPay, delivering, finished };
  }, [orders]);

  async function handleGoPay(order: OrderVO) {
    try {
      const { storefrontApi } = await import("@/lib/api");
      const payment = await storefrontApi.getOrderPayment(order.id);
      router.push(`/payment/${payment.paymentNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取支付信息失败");
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth>
        <LoadingState label="正在加载订单列表..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="space-y-5">
        <section className="store-section overflow-hidden p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_340px] lg:items-end">
            <div>
              <div className="store-kicker">
                <ReceiptText className="h-4 w-4" />
                我的订单
              </div>
              <h1 className="mt-2 text-[2rem] font-bold text-ink">把支付、履约和售后状态放在同一页里持续可追踪</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                订单页需要给用户明确的状态感。这里不仅展示商品，还突出支付动作、时间节点和收货进度。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="store-pill bg-[#fff7f2]">支持待支付订单继续付款</span>
                <span className="store-pill bg-[#fff7f2]">发货后可在详情页确认收货</span>
                <span className="store-pill bg-[#fff7f2]">订单信息与商品明细同步展示</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <SummaryCard icon={CreditCard} label="待支付" value={`${summary.waitingPay}`} />
              <SummaryCard icon={Truck} label="待收货 / 发货中" value={`${summary.delivering}`} />
              <SummaryCard icon={PackageCheck} label="已完成" value={`${summary.finished}`} />
            </div>
          </div>
        </section>

        <section className="store-section p-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.value
                    ? "bg-accent text-white"
                    : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
                }`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {orders.length ? (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} onGoPay={handleGoPay} order={order} />
              ))}
            </div>
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="暂无订单"
            description="还没有生成任何订单，先去挑选几件想买的商品吧。"
            action={{ label: "去逛商品", onClick: () => router.push("/products") }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-[linear-gradient(135deg,#1d2433,#252f43)] p-5 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-sm text-white/72">{label}</div>
      <div className="mt-1 text-3xl font-extrabold">{value}</div>
    </div>
  );
}
