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
import { formatDateTime } from "@/lib/format";
import type { UserPageItem, UserVO } from "@/lib/types";

export default function AdminUserPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<UserPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<UserVO | null>(null);
  const [open, setOpen] = useState(false);
  const [pointsDelta, setPointsDelta] = useState("0");

  useEffect(() => {
    void loadData();
  }, [keyword, page, role, status]);

  async function loadData() {
    try {
      const pageData = await adminApi.getUsers({
        pageNum: page,
        pageSize: 10,
        username: keyword || undefined,
        status: status ? Number(status) : undefined,
        role: role ? Number(role) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取用户列表失败");
    }
  }

  async function handleViewDetail(id: number) {
    try {
      const data = await adminApi.getUserById(id);
      setDetail(data);
      setPointsDelta("0");
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取用户详情失败");
    }
  }

  async function handleToggleStatus(item: UserPageItem) {
    try {
      await adminApi.updateUserStatus(item.id, item.status === 1 ? 0 : 1);
      toast.success(item.status === 1 ? "用户已禁用" : "用户已启用");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新用户状态失败");
    }
  }

  async function handleToggleRole(item: UserPageItem) {
    try {
      await adminApi.updateUserRole(item.id, item.role === 1 ? 0 : 1);
      toast.success(item.role === 1 ? "已降级为普通用户" : "已提升为管理员");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新用户角色失败");
    }
  }

  async function handleAdjustPoints() {
    if (!detail) {
      return;
    }

    try {
      await adminApi.updateUserPoints(detail.id, Number(pointsDelta || "0"));
      toast.success("积分调整成功");
      const refreshed = await adminApi.getUserById(detail.id);
      setDetail(refreshed);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "调整积分失败");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Users
            </p>
            <h2 className="mt-3 text-2xl font-black">用户管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_140px_140px]">
            <Input placeholder="搜索用户名" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="1">正常</option>
              <option value="0">禁用</option>
            </Select>
            <Select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">全部角色</option>
              <option value="0">普通用户</option>
              <option value="1">管理员</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[1100px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>手机号</th>
              <th>角色</th>
              <th>状态</th>
              <th>积分</th>
              <th>等级</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="font-semibold text-slate-950">{item.username}</td>
                <td>{item.nickname || "-"}</td>
                <td>{item.phone || "-"}</td>
                <td>
                  <Badge tone={item.role === 1 ? "warning" : "neutral"}>
                    {item.role === 1 ? "管理员" : "普通用户"}
                  </Badge>
                </td>
                <td>
                  <Badge tone={item.status === 1 ? "success" : "danger"}>
                    {item.status === 1 ? "正常" : "禁用"}
                  </Badge>
                </td>
                <td>{item.points}</td>
                <td>Lv.{item.level}</td>
                <td>{formatDateTime(item.createTime)}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void handleViewDetail(item.id)}>
                      详情
                    </Button>
                    <Button variant="ghost" onClick={() => void handleToggleStatus(item)}>
                      {item.status === 1 ? "禁用" : "启用"}
                    </Button>
                    <Button variant="ghost" onClick={() => void handleToggleRole(item)}>
                      {item.role === 1 ? "降为用户" : "升为管理员"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />

      <Modal
        className="max-w-3xl"
        description="用户详情页保留角色展示、搜索过滤和积分调整工作流。"
        onClose={() => setOpen(false)}
        open={open}
        title={detail ? `用户详情 · ${detail.username}` : "用户详情"}
      >
        {detail ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="用户名" value={detail.username} />
              <Info label="昵称" value={detail.nickname || "-"} />
              <Info label="手机号" value={detail.phone || "-"} />
              <Info label="邮箱" value={detail.email || "-"} />
              <Info label="角色" value={detail.role === 1 ? "管理员" : "普通用户"} />
              <Info label="状态" value={detail.status === 1 ? "正常" : "禁用"} />
              <Info label="积分" value={String(detail.points)} />
              <Info label="等级" value={`Lv.${detail.level}`} />
            </div>
            <Card className="rounded-[24px]">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label className="field-label">积分调整值</label>
                  <Input value={pointsDelta} onChange={(event) => setPointsDelta(event.target.value)} />
                </div>
                <Button onClick={() => void handleAdjustPoints()}>确认调整</Button>
              </div>
            </Card>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
