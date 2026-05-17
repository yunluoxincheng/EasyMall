"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { storefrontApi } from "@/lib/api";
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

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderVO[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const pageData = await storefrontApi.getOrders({
          pageNum: page,
          pageSize: 8,
          status: activeTab ? Number(activeTab) : undefined,
        });
        if (!cancelled) {
          setOrders(pageData.records);
          setTotal(pageData.total);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "获取订单列表失败");
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
  }, [activeTab, page]);

  async function handleGoPay(order: OrderVO) {
    try {
      const payment = await storefrontApi.getOrderPayment(order.id);
      router.push(`/payment/${payment.paymentNo}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取支付信息失败");
    }
  }

  if (loading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载订单列表..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="space-y-5">
        <Card className="rounded-[34px]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Orders
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            我的订单
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.value
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
        </Card>

        {orders.length ? (
          <>
            {orders.map((order) => (
              <Card key={order.id} className="rounded-[30px]">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-5">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        订单号：{order.orderNo}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        下单时间：{formatDateTime(order.createTime)}
                      </div>
                    </div>
                    <Badge tone={getStatusTone(order.status)}>
                      {order.statusText || getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px] md:items-center">
                    <div className="space-y-3">
                      {order.orderItems.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex gap-4 rounded-[24px] bg-slate-50 p-4">
                          <div className="h-16 w-16 overflow-hidden rounded-[18px] bg-slate-100">
                            <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 font-bold text-slate-950">{item.productName}</div>
                            <div className="mt-2 text-sm text-slate-500">
                              {formatCurrency(item.productPrice || 0)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 text-right">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                          实付金额
                        </div>
                        <div className="mt-2 text-2xl font-black text-rose-600">
                          {formatCurrency(order.payAmount)}
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-3">
                        <Button variant="secondary" onClick={() => router.push(`/orders/${order.id}`)}>
                          查看详情
                        </Button>
                        {order.status === 0 ? (
                          <Button onClick={() => void handleGoPay(order)}>去支付</Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="暂无订单"
            description="你还没有生成任何订单。先去浏览商品，加入购物车后再回来。"
            action={{
              label: "去逛商品",
              onClick: () => router.push("/products"),
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
