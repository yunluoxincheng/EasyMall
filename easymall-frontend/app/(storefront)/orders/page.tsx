"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { useOrders, useOrderPayment } from "@/lib/hooks";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getStatusTone } from "@/lib/format";
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
    <div className="rounded-lg bg-white p-4 shadow-card">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <div className="text-sm font-medium text-ink">订单号：{order.orderNo}</div>
          <div className="text-xs text-muted">{formatDateTime(order.createTime)}</div>
        </div>
        <Badge tone={getStatusTone(order.status)}>
          {order.statusText || getOrderStatusLabel(order.status)}
        </Badge>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <div className="flex-1 space-y-2">
          {order.orderItems.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md bg-gray-50 p-2">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-medium text-ink">{item.productName}</div>
                <div className="text-xs text-muted">{formatCurrency(item.productPrice || 0)} × {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted">实付金额</div>
          <div className="text-lg font-bold text-accent">{formatCurrency(order.payAmount)}</div>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="text-xs h-7 px-2" onClick={() => router.push(`/orders/${order.id}`)}>
              详情
            </Button>
            {order.status === 0 ? (
              <Button className="text-xs h-7 px-2" onClick={() => onGoPay(order)}>去支付</Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

  const { data: orderPage, isLoading } = useOrders({
    pageNum: page,
    pageSize: 8,
    status: activeTab ? Number(activeTab) : undefined,
  });

  const orders = orderPage?.records ?? [];
  const total = orderPage?.total ?? 0;

  useOrderPayment(payingOrderId ?? 0);

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
    return <ProtectedRoute requireAuth><LoadingState label="正在加载订单列表..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="space-y-3">
        <div className="rounded-lg bg-white p-4 shadow-card">
          <h1 className="text-lg font-semibold text-ink">我的订单</h1>
          <div className="mt-3 flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  activeTab === tab.value
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-muted hover:bg-accent-light hover:text-accent"
                }`}
                onClick={() => { setActiveTab(tab.value); setPage(1); }}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {orders.length ? (
          <>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onGoPay={handleGoPay} />
            ))}
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="暂无订单"
            description="还没有生成任何订单，先去逛逛商品吧"
            action={{ label: "去逛商品", onClick: () => router.push("/products") }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
