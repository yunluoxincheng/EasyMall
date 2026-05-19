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
import { useAdminCreateCategory, useAdminDeleteCategory, useAdminUpdateCategory, useAdminUpdateCategoryStatus } from "@/lib/hooks";
import type { CategoryFormData, CategoryPageItem } from "@/lib/types";

const emptyForm: CategoryFormData = {
  name: "",
  icon: "",
  parentId: null,
  level: 1,
  sort: 0,
  status: 1,
};

export default function AdminCategoryPage() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CategoryPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryPageItem | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const createCategory = useAdminCreateCategory();
  const updateCategory = useAdminUpdateCategory();
  const updateCategoryStatus = useAdminUpdateCategoryStatus();
  const deleteCategory = useAdminDeleteCategory();

  useEffect(() => {
    void loadData();
  }, [keyword, page, status]);

  async function loadData() {
    setLoading(true);
    try {
      const pageData = await adminApi.getCategories({
        pageNum: page,
        pageSize: 10,
        name: keyword || undefined,
        status: status ? Number(status) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取分类失败");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  function handleEdit(item: CategoryPageItem) {
    setEditing(item);
    setForm({
      name: item.name,
      icon: item.icon || "",
      parentId: item.parentId || null,
      level: item.level,
      sort: item.sort,
      status: item.status,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.warning("请输入分类名称");
      return;
    }

    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, payload: form });
        toast.success("分类已更新");
      } else {
        await createCategory.mutateAsync(form);
        toast.success("分类已创建");
      }
      setOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存分类失败");
    }
  }

  async function handleToggleStatus(item: CategoryPageItem) {
    try {
      await updateCategoryStatus.mutateAsync({ id: item.id, status: item.status === 1 ? 0 : 1 });
      toast.success(item.status === 1 ? "分类已禁用" : "分类已启用");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新分类状态失败");
    }
  }

  async function handleDelete(item: CategoryPageItem) {
    if (!window.confirm(`确定删除分类「${item.name}」吗？`)) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(item.id);
      toast.success("分类已删除");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除分类失败");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Categories
            </p>
            <h2 className="mt-3 text-2xl font-black">分类管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_140px_auto]">
            <Input placeholder="搜索分类名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="1">启用</option>
              <option value="0">禁用</option>
            </Select>
            <Button onClick={() => setOpen(true)}>新增分类</Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[960px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>父分类</th>
              <th>层级</th>
              <th>排序</th>
              <th>状态</th>
              <th>数据说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="font-semibold text-slate-950">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.icon || "未配置图标"}</div>
                </td>
                <td>{item.parentName || "-"}</td>
                <td>{item.level}</td>
                <td>{item.sort}</td>
                <td>
                  <Badge tone={item.status === 1 ? "success" : "neutral"}>
                    {item.status === 1 ? "启用" : "禁用"}
                  </Badge>
                </td>
                <td className="text-slate-500">列表接口未返回时间字段</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => handleEdit(item)}>
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
        {!loading && !items.length ? (
          <div className="py-10 text-center text-sm text-slate-500">暂无分类数据</div>
        ) : null}
      </Card>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />

      <Modal
        description="分类页支持树状 / 表格信息维护；当前使用显式的父分类 ID 与层级字段保证表格密度。"
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        open={open}
        title={editing ? "编辑分类" : "新增分类"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">分类名称</label>
            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">图标 / 标记</label>
            <Input value={form.icon} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">父分类 ID</label>
            <Input type="number" value={form.parentId ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, parentId: Number(event.target.value) || null }))} />
          </div>
          <div>
            <label className="field-label">层级</label>
            <Input type="number" value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: Number(event.target.value || 1) }))} />
          </div>
          <div>
            <label className="field-label">排序</label>
            <Input type="number" value={form.sort} onChange={(event) => setForm((prev) => ({ ...prev, sort: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">状态</label>
            <Select value={String(form.status)} onChange={(event) => setForm((prev) => ({ ...prev, status: Number(event.target.value) }))}>
              <option value="1">启用</option>
              <option value="0">禁用</option>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={() => void handleSubmit()}>保存分类</Button>
        </div>
      </Modal>
    </div>
  );
}
