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
import {
  useAdminCreatePointsProduct,
  useAdminDeletePointsProduct,
  useAdminUpdatePointsProduct,
  useAdminUpdatePointsProductStatus,
} from "@/lib/hooks";
import { formatDateTime } from "@/lib/format";
import type { PointsProductFormData, PointsProductPageItem } from "@/lib/types";

const emptyForm: PointsProductFormData = {
  name: "",
  description: "",
  image: "",
  pointsRequired: null,
  stock: null,
  sortOrder: 0,
};

export default function AdminPointsProductPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<PointsProductPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PointsProductPageItem | null>(null);
  const [form, setForm] = useState<PointsProductFormData>(emptyForm);
  const createPointsProduct = useAdminCreatePointsProduct();
  const updatePointsProduct = useAdminUpdatePointsProduct();
  const updatePointsProductStatus = useAdminUpdatePointsProductStatus();
  const deletePointsProduct = useAdminDeletePointsProduct();

  useEffect(() => {
    void loadData();
  }, [keyword, page, status]);

  async function loadData() {
    try {
      const pageData = await adminApi.getPointsProducts({
        pageNum: page,
        pageSize: 10,
        name: keyword || undefined,
        status: status ? Number(status) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取积分商品失败");
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.pointsRequired || form.stock == null) {
      toast.warning("请填写商品名称、所需积分和库存");
      return;
    }

    try {
      if (editing) {
        await updatePointsProduct.mutateAsync({ id: editing.id, payload: form });
        toast.success("积分商品已更新");
      } else {
        await createPointsProduct.mutateAsync(form);
        toast.success("积分商品已创建");
      }
      setOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存积分商品失败");
    }
  }

  async function handleToggleStatus(item: PointsProductPageItem) {
    try {
      await updatePointsProductStatus.mutateAsync({ id: item.id, status: item.status === 1 ? 0 : 1 });
      toast.success(item.status === 1 ? "积分商品已下架" : "积分商品已上架");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新积分商品状态失败");
    }
  }

  async function handleDelete(item: PointsProductPageItem) {
    if (!window.confirm(`确定删除积分商品「${item.name}」吗？`)) {
      return;
    }
    try {
      await deletePointsProduct.mutateAsync(item.id);
      toast.success("积分商品已删除");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除积分商品失败");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Points Products
            </p>
            <h2 className="mt-3 text-2xl font-black">积分商品管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_150px_auto]">
            <Input placeholder="搜索商品名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="1">上架</option>
              <option value="0">下架</option>
            </Select>
            <Button onClick={() => setOpen(true)}>新增积分商品</Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[1080px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>描述</th>
              <th>所需积分</th>
              <th>库存</th>
              <th>已兑换</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="font-semibold text-slate-950">{item.name}</td>
                <td className="max-w-[260px]">{item.description || "-"}</td>
                <td>{item.pointsRequired}</td>
                <td>{item.stock}</td>
                <td>{item.exchangeCount}</td>
                <td>
                  <Badge tone={item.status === 1 ? "success" : "neutral"}>
                    {item.status === 1 ? "上架" : "下架"}
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
                          name: item.name,
                          description: item.description || "",
                          image: item.image || "",
                          pointsRequired: item.pointsRequired,
                          stock: item.stock,
                          sortOrder: item.sortOrder,
                        });
                        setOpen(true);
                      }}
                    >
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

      <Modal
        description="积分商品页强调所需积分、库存和状态控制，便于后台维护兑换体验。"
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        open={open}
        title={editing ? "编辑积分商品" : "新增积分商品"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">商品名称</label>
            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">图片 URL</label>
            <Input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">所需积分</label>
            <Input type="number" value={form.pointsRequired ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, pointsRequired: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">库存</label>
            <Input type="number" value={form.stock ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">排序</label>
            <Input type="number" value={form.sortOrder} onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value || 0) }))} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">描述</label>
            <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={() => void handleSubmit()}>保存积分商品</Button>
        </div>
      </Modal>
    </div>
  );
}
