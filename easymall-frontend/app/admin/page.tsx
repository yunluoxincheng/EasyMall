"use client";

import { AlertTriangle, Box, ClipboardList, MessageSquareText, PackageCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { adminApi } from "@/lib/api";

interface DashboardState {
  totalProducts: number;
  totalOrders: number;
  waitingShipment: number;
  totalUsers: number;
  pendingComments: number;
}

export default function AdminDashboardPage() {
  const [state, setState] = useState<DashboardState>({
    totalProducts: 0,
    totalOrders: 0,
    waitingShipment: 0,
    totalUsers: 0,
    pendingComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [partialError, setPartialError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setPartialError(null);
      try {
        const [products, orders, waitingShipment, users, pendingComments] = await Promise.all([
          adminApi.getProducts({ pageNum: 1, pageSize: 1 }),
          adminApi.getOrders({ pageNum: 1, pageSize: 1 }),
          adminApi.getOrders({ pageNum: 1, pageSize: 1, status: 5 }),
          adminApi.getUsers({ pageNum: 1, pageSize: 1 }),
          adminApi.getComments({ pageNum: 1, pageSize: 1, showStatus: 0 }),
        ]);

        if (!cancelled) {
          setState({
            totalProducts: products.total,
            totalOrders: orders.total,
            waitingShipment: waitingShipment.total,
            totalUsers: users.total,
            pendingComments: pendingComments.total,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setPartialError(error instanceof Error ? error.message : "仪表盘数据加载失败");
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={<Box className="h-5 w-5" />}
          label="商品总数"
          value={loading ? "..." : String(state.totalProducts)}
          tone="success"
        />
        <MetricCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="订单总数"
          value={loading ? "..." : String(state.totalOrders)}
          tone="info"
        />
        <MetricCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="待发货"
          value={loading ? "..." : String(state.waitingShipment)}
          tone="warning"
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="用户总数"
          value={loading ? "..." : String(state.totalUsers)}
          tone="neutral"
        />
        <MetricCard
          icon={<MessageSquareText className="h-5 w-5" />}
          label="待审核评论"
          value={loading ? "..." : String(state.pendingComments)}
          tone="danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[30px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">近期运营概览</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                仪表盘优先展示能从现有后端真实计算出来的摘要指标。更细的销售额、活动转化和趋势图，
                当前版本会明确标记为待接入，而不是伪造业务数据。
              </p>
            </div>
            {partialError ? <Badge tone="warning">部分数据失败</Badge> : <Badge tone="success">真实数据优先</Badge>}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TodoPanel
              title="销售额与 GMV"
              description="待接入专用仪表盘汇总接口。当前后台没有可直接复用的销售统计聚合能力。"
            />
            <TodoPanel
              title="库存预警"
              description="后续可基于商品库存和阈值配置增加自动预警，目前建议通过商品列表过滤查看。"
            />
            <TodoPanel
              title="近 7 日趋势"
              description="需要新增时间维度统计接口后再绘制折线图。"
            />
            <TodoPanel
              title="营销活动转化"
              description="优惠券领取/使用趋势已有基础数据，可继续扩展为图表模块。"
            />
          </div>
        </Card>

        <Card className="rounded-[30px]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-black">待处理事项</h2>
          </div>
          <div className="mt-6 space-y-4">
            <TaskRow label="待发货订单" value={loading ? "..." : String(state.waitingShipment)} />
            <TaskRow label="待审核评论" value={loading ? "..." : String(state.pendingComments)} />
            <TaskRow label="商品管理" value="支持上架 / 下架 / 库存更新" />
            <TaskRow label="优惠券中心" value="后续可加发放与使用趋势监控" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
}) {
  return (
    <Card className="rounded-[28px]">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <div className="mt-6 text-4xl font-black text-slate-950">{value}</div>
    </Card>
  );
}

function TodoPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-slate-50 p-5">
      <div className="text-lg font-black text-slate-950">{title}</div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
      <div className="mt-4">
        <Badge tone="neutral">待接入</Badge>
      </div>
    </div>
  );
}

function TaskRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-slate-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-black text-slate-950">{value}</div>
    </div>
  );
}
