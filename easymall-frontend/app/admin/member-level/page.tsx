"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { MemberLevelFormData, MemberLevelItem } from "@/lib/types";

const emptyForm: MemberLevelFormData = {
  level: null,
  levelName: "",
  minPoints: null,
  maxPoints: null,
  discount: null,
  icon: "",
  benefits: "",
  sortOrder: 0,
};

export default function AdminMemberLevelPage() {
  const [items, setItems] = useState<MemberLevelItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MemberLevelItem | null>(null);
  const [form, setForm] = useState<MemberLevelFormData>(emptyForm);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const data = await adminApi.getMemberLevels();
      setItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取会员等级失败");
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  async function handleSubmit() {
    if (!form.level || !form.levelName.trim() || form.discount == null) {
      toast.warning("请填写等级、名称和折扣率");
      return;
    }

    try {
      if (editing) {
        await adminApi.updateMemberLevel(editing.id, form);
        toast.success("会员等级已更新");
      } else {
        await adminApi.createMemberLevel(form);
        toast.success("会员等级已创建");
      }
      setOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存会员等级失败");
    }
  }

  async function handleToggleStatus(item: MemberLevelItem) {
    try {
      await adminApi.updateMemberLevelStatus(item.id, item.status === 1 ? 0 : 1);
      toast.success(item.status === 1 ? "等级已禁用" : "等级已启用");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新等级状态失败");
    }
  }

  async function handleDelete(item: MemberLevelItem) {
    if (!window.confirm(`确定删除等级「${item.levelName}」吗？`)) {
      return;
    }
    try {
      await adminApi.deleteMemberLevel(item.id);
      toast.success("会员等级已删除");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除等级失败");
    }
  }

  const filtered = keyword
    ? items.filter((item) => item.levelName.toLowerCase().includes(keyword.toLowerCase()))
    : items;

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Member Levels
            </p>
            <h2 className="mt-3 text-2xl font-black">会员等级管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_auto]">
            <Input placeholder="搜索等级名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Button onClick={() => setOpen(true)}>新增等级</Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[980px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>等级</th>
              <th>名称</th>
              <th>积分范围</th>
              <th>折扣率</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>Lv.{item.level}</td>
                <td>
                  <div className="font-semibold text-slate-950">{item.levelName}</div>
                  <div className="text-sm text-slate-500">{item.benefits || "无额外说明"}</div>
                </td>
                <td>
                  {item.minPoints} - {item.maxPoints}
                </td>
                <td>{Math.round(item.discount * 100)}%</td>
                <td>
                  <Badge tone={item.status === 1 ? "success" : "neutral"}>
                    {item.status === 1 ? "启用" : "禁用"}
                  </Badge>
                </td>
                <td>{formatDateTime(item.createTime)}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(item);
                        setForm({
                          level: item.level,
                          levelName: item.levelName,
                          minPoints: item.minPoints,
                          maxPoints: item.maxPoints,
                          discount: item.discount,
                          icon: item.icon || "",
                          benefits: item.benefits || "",
                          sortOrder: item.sortOrder,
                        });
                        setOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                    <Button variant="ghost" onClick={() => void handleToggleStatus(item)}>
                      {item.status === 1 ? "禁用" : "启用"}
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

      <Modal
        description="等级页保留积分区间、折扣率和权益说明编辑。"
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        open={open}
        title={editing ? "编辑会员等级" : "新增会员等级"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">等级</label>
            <Input type="number" value={form.level ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, level: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">等级名称</label>
            <Input value={form.levelName} onChange={(event) => setForm((prev) => ({ ...prev, levelName: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">最小积分</label>
            <Input type="number" value={form.minPoints ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, minPoints: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">最大积分</label>
            <Input type="number" value={form.maxPoints ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, maxPoints: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">折扣率</label>
            <Input type="number" value={form.discount ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, discount: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">排序</label>
            <Input type="number" value={form.sortOrder} onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value || 0) }))} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">权益说明</label>
            <Textarea value={form.benefits} onChange={(event) => setForm((prev) => ({ ...prev, benefits: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={() => void handleSubmit()}>保存等级</Button>
        </div>
      </Modal>
    </div>
  );
}
