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
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CouponTemplateDTO, CouponTemplateVO, CouponUsageLogVO } from "@/lib/types";

const emptyForm: CouponTemplateDTO = {
  name: "",
  type: null,
  discountAmount: null,
  discountPercentage: null,
  minAmount: null,
  maxDiscount: null,
  totalCount: null,
  memberLevel: 0,
  validDays: 0,
  startTime: "",
  endTime: "",
  sortOrder: 0,
  status: 1,
  description: "",
};

export default function AdminCouponPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [items, setItems] = useState<CouponTemplateVO[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [logs, setLogs] = useState<CouponUsageLogVO[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponTemplateVO | null>(null);
  const [form, setForm] = useState<CouponTemplateDTO>(emptyForm);

  useEffect(() => {
    void loadData();
  }, [keyword, page, status, type]);

  useEffect(() => {
    void loadStats();
    void loadLogs();
  }, []);

  async function loadData() {
    try {
      const pageData = await adminApi.getCoupons({
        pageNum: page,
        pageSize: 10,
        name: keyword || undefined,
        status: status ? Number(status) : undefined,
        type: type ? Number(type) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取优惠券模板失败");
    }
  }

  async function loadStats() {
    try {
      const data = await adminApi.getCouponStatistics();
      setStats(data);
    } catch {
      setStats({});
    }
  }

  async function loadLogs() {
    try {
      const pageData = await adminApi.getCouponUsageLogs({
        pageNum: 1,
        pageSize: 5,
      });
      setLogs(pageData.records);
    } catch {
      setLogs([]);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  async function handleEdit(item: CouponTemplateVO) {
    try {
      const detail = await adminApi.getCouponById(item.id);
      setEditing(item);
      setForm({
        id: detail.id,
        name: detail.name,
        type: detail.type,
        discountAmount: detail.discountAmount,
        discountPercentage: detail.discountPercentage,
        minAmount: detail.minAmount,
        maxDiscount: detail.maxDiscount,
        totalCount: detail.totalCount,
        memberLevel: detail.memberLevel,
        validDays: detail.validDays,
        startTime: detail.startTime || "",
        endTime: detail.endTime || "",
        sortOrder: detail.sortOrder,
        status: detail.status,
        description: detail.description || "",
      });
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取优惠券详情失败");
    }
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.type || !form.totalCount) {
      toast.warning("请填写优惠券名称、类型和发行数量");
      return;
    }

    try {
      if (editing) {
        await adminApi.updateCoupon({
          ...form,
          id: editing.id,
        });
        toast.success("优惠券已更新");
      } else {
        await adminApi.createCoupon(form);
        toast.success("优惠券已创建");
      }
      setOpen(false);
      resetForm();
      await loadData();
      await loadStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存优惠券失败");
    }
  }

  async function handleToggleStatus(item: CouponTemplateVO) {
    try {
      await adminApi.updateCouponStatus(item.id, item.status === 1 ? 0 : 1);
      toast.success(item.status === 1 ? "优惠券已下架" : "优惠券已上架");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新优惠券状态失败");
    }
  }

  async function handleDelete(item: CouponTemplateVO) {
    if (!window.confirm(`确定删除优惠券「${item.name}」吗？`)) {
      return;
    }
    try {
      await adminApi.deleteCoupon(item.id);
      toast.success("优惠券已删除");
      await loadData();
      await loadStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除优惠券失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-4">
        <Metric label="总模板数" value={String(stats.totalTemplates ?? "-")} />
        <Metric label="已上架模板" value={String(stats.activeTemplates ?? "-")} />
        <Metric label="总领取数" value={String(stats.totalReceived ?? "-")} />
        <Metric label="总使用数" value={String(stats.totalUsed ?? "-")} />
      </div>

      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Coupons
            </p>
            <h2 className="mt-3 text-2xl font-black">优惠券管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_150px_150px_auto]">
            <Input placeholder="搜索名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">全部类型</option>
              <option value="1">固定金额券</option>
              <option value="2">折扣券</option>
              <option value="3">满减券</option>
              <option value="4">无门槛券</option>
            </Select>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="1">上架</option>
              <option value="0">下架</option>
            </Select>
            <Button onClick={() => setOpen(true)}>新增优惠券</Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[1240px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>类型</th>
              <th>优惠规则</th>
              <th>发行 / 剩余</th>
              <th>已领 / 已用</th>
              <th>状态</th>
              <th>有效期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="font-semibold text-slate-950">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.description || "无说明"}</div>
                </td>
                <td>{item.typeDesc}</td>
                <td>
                  {item.type === 2
                    ? `${item.discountPercentage} 折`
                    : formatCurrency(item.discountAmount)}
                </td>
                <td>
                  {item.totalCount} / {item.remainingCount}
                </td>
                <td>
                  {item.receivedCount} / {item.usedCount}
                </td>
                <td>
                  <Badge tone={item.status === 1 ? "success" : "neutral"}>
                    {item.statusDesc}
                  </Badge>
                </td>
                <td>
                  {item.validDays > 0
                    ? `领取后 ${item.validDays} 天`
                    : `${formatDate(item.startTime)} - ${formatDate(item.endTime)}`}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void handleEdit(item)}>
                      编辑
                    </Button>
                    <Button variant="ghost" onClick={() => void handleToggleStatus(item)}>
                      {item.status === 1 ? "下架" : "上架"}
                    </Button>
                    <Button variant="danger" onClick={() => void handleDelete(item)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />

      <Card className="rounded-[30px]">
        <h3 className="text-xl font-black">最近使用记录</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="admin-table min-w-[980px]">
            <thead>
              <tr>
                <th>用户 ID</th>
                <th>优惠券</th>
                <th>类型</th>
                <th>订单号</th>
                <th>订单金额</th>
                <th>优惠金额</th>
                <th>动作</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.userId}</td>
                  <td>{log.couponName}</td>
                  <td>{log.couponTypeDesc}</td>
                  <td>{log.orderNo}</td>
                  <td>{formatCurrency(log.orderAmount)}</td>
                  <td>{formatCurrency(log.discountAmount)}</td>
                  <td>{log.actionDesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        className="max-w-4xl"
        description="首版后台以模板维护、状态控制和基础统计为主，发放与趋势可以继续扩展。"
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        open={open}
        title={editing ? "编辑优惠券" : "新增优惠券"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">名称</label>
            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">类型</label>
            <Select value={String(form.type || "")} onChange={(event) => setForm((prev) => ({ ...prev, type: Number(event.target.value) || null }))}>
              <option value="">选择类型</option>
              <option value="1">固定金额券</option>
              <option value="2">折扣券</option>
              <option value="3">满减券</option>
              <option value="4">无门槛券</option>
            </Select>
          </div>
          <div>
            <label className="field-label">优惠金额</label>
            <Input type="number" value={form.discountAmount ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, discountAmount: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">折扣比例</label>
            <Input type="number" value={form.discountPercentage ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, discountPercentage: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">最低消费</label>
            <Input type="number" value={form.minAmount ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, minAmount: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">最大优惠</label>
            <Input type="number" value={form.maxDiscount ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, maxDiscount: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">发行数量</label>
            <Input type="number" value={form.totalCount ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, totalCount: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">会员等级限制</label>
            <Input type="number" value={form.memberLevel} onChange={(event) => setForm((prev) => ({ ...prev, memberLevel: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">有效天数</label>
            <Input type="number" value={form.validDays} onChange={(event) => setForm((prev) => ({ ...prev, validDays: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">状态</label>
            <Select value={String(form.status)} onChange={(event) => setForm((prev) => ({ ...prev, status: Number(event.target.value) }))}>
              <option value="1">上架</option>
              <option value="0">下架</option>
            </Select>
          </div>
          <div>
            <label className="field-label">开始时间</label>
            <Input value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} placeholder="2026-05-17T10:00:00" />
          </div>
          <div>
            <label className="field-label">结束时间</label>
            <Input value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} placeholder="2026-05-31T23:59:59" />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">使用说明</label>
            <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={() => void handleSubmit()}>保存优惠券</Button>
        </div>
      </Modal>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[28px]">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-4 text-4xl font-black text-slate-950">{value}</div>
    </Card>
  );
}
