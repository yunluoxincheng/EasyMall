"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { useAdminCancelOrder, useAdminUpdateOrderStatus } from "@/lib/hooks";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getStatusTone } from "@/lib/format";
import type { OrderDetailAdmin, OrderPageItem } from "@/lib/types";

export default function AdminOrderPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<OrderPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<OrderDetailAdmin | null>(null);
  const [open, setOpen] = useState(false);
  const updateOrderStatus = useAdminUpdateOrderStatus();
  const cancelOrder = useAdminCancelOrder();

  useEffect(() => {
    void loadData();
  }, [keyword, page, status]);

  async function loadData() {
    try {
      const pageData = await adminApi.getOrders({
        pageNum: page,
        pageSize: 10,
        orderNo: keyword || undefined,
        status: status ? Number(status) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取订单失败");
    }
  }

  async function handleViewDetail(id: number) {
    try {
      const data = await adminApi.getOrderById(id);
      setDetail(data);
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取订单详情失败");
    }
  }

  async function handleShip(item: OrderPageItem) {
    try {
      await updateOrderStatus.mutateAsync({ id: item.id, status: 2 });
      toast.success("订单已标记为已发货");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "发货失败");
    }
  }

  async function handleCancel(item: OrderPageItem) {
    if (!window.confirm(`确定取消订单「${item.orderNo}」吗？`)) {
      return;
    }
    try {
      await cancelOrder.mutateAsync(item.id);
      toast.success("订单已取消");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "取消订单失败");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Orders
            </p>
            <h2 className="mt-3 text-2xl font-black">订单管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_160px]">
            <Input placeholder="搜索订单号" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="0">待支付</option>
              <option value="5">待发货</option>
              <option value="2">已发货</option>
              <option value="3">已完成</option>
              <option value="4">已取消</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[1100px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>订单号</th>
              <th>用户</th>
              <th>总金额</th>
              <th>实付金额</th>
              <th>状态</th>
              <th>支付方式</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="font-semibold text-slate-950">{item.orderNo}</td>
                <td>{item.nickname || item.username}</td>
                <td>{formatCurrency(item.totalAmount)}</td>
                <td>{formatCurrency(item.payAmount)}</td>
                <td>
                  <Badge tone={getStatusTone(item.status)}>
                    {getOrderStatusLabel(item.status)}
                  </Badge>
                </td>
                <td>{item.paymentMethod || "-"}</td>
                <td>{formatDateTime(item.createTime)}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void handleViewDetail(item.id)}>
                      详情
                    </Button>
                    {item.status === 5 ? (
                      <Button variant="ghost" onClick={() => void handleShip(item)}>
                        发货
                      </Button>
                    ) : null}
                    {[0, 1, 5].includes(item.status) ? (
                      <Button variant="danger" onClick={() => void handleCancel(item)}>
                        取消
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />

      <Modal
        className="max-w-5xl"
        description="详情抽屉改为弹窗，保留订单状态、收货信息和订单商品明细。"
        onClose={() => setOpen(false)}
        open={open}
        title={detail ? `订单详情 · ${detail.orderNo}` : "订单详情"}
      >
        {detail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="状态" value={getOrderStatusLabel(detail.status)} />
              <Info label="支付方式" value={detail.paymentMethod || "-"} />
              <Info label="用户" value={detail.nickname || detail.username} />
              <Info label="手机号" value={detail.phone || "-"} />
              <Info label="收货人" value={detail.receiverName || "-"} />
              <Info label="收货电话" value={detail.receiverPhone || "-"} />
              <Info label="收货地址" value={detail.receiverAddress || "-"} full />
              <Info label="备注" value={detail.remark || "无"} full />
            </div>
            <Card className="rounded-[24px]">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>商品</th>
                    <th>数量</th>
                    <th>单价</th>
                    <th>小计</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price || 0)}</td>
                      <td>{formatCurrency(item.subtotal || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function Info({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
