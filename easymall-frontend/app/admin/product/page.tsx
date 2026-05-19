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
  useAdminCreateProduct,
  useAdminDeleteProduct,
  useAdminUpdateProduct,
  useAdminUpdateProductStatus,
  useAdminUpdateProductStock,
} from "@/lib/hooks";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { CategoryPageItem, ProductDetail, ProductFormData, ProductPageItem } from "@/lib/types";

const emptyForm: ProductFormData = {
  name: "",
  subtitle: "",
  description: "",
  originalPrice: null,
  price: null,
  stock: null,
  image: "",
  images: "",
  categoryId: null,
  brand: "",
};

export default function AdminProductPage() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProductPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<CategoryPageItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();
  const updateProductStatus = useAdminUpdateProductStatus();
  const updateProductStock = useAdminUpdateProductStock();
  const deleteProduct = useAdminDeleteProduct();

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadData();
  }, [page, keyword, status]);

  async function loadCategories() {
    try {
      const pageData = await adminApi.getCategories({ pageNum: 1, pageSize: 100 });
      setCategories(pageData.records);
    } catch {
      // Keep the page usable even if categories fail to load.
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const pageData = await adminApi.getProducts({
        pageNum: page,
        pageSize: 10,
        name: keyword || undefined,
        status: status ? Number(status) : undefined,
      });
      setItems(pageData.records);
      setTotal(pageData.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取商品列表失败");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleEdit(id: number) {
    try {
      const detail: ProductDetail = await adminApi.getProductById(id);
      setEditingId(id);
      setForm({
        name: detail.name,
        subtitle: detail.subtitle || "",
        description: detail.description || "",
        originalPrice: detail.originalPrice,
        price: detail.price,
        stock: detail.stock,
        image: detail.image || "",
        images: Array.isArray(detail.images) ? detail.images.join(",") : "",
        categoryId: detail.categoryId,
        brand: detail.brand || "",
      });
      setOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取商品详情失败");
    }
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.price || form.stock == null || !form.categoryId) {
      toast.warning("请补全商品名称、售价、库存和分类");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, payload: form });
        await updateProductStock.mutateAsync({ id: editingId, stock: form.stock || 0 });
        toast.success("商品已更新");
      } else {
        await createProduct.mutateAsync(form);
        toast.success("商品已创建");
      }
      setOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存商品失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(item: ProductPageItem) {
    try {
      await updateProductStatus.mutateAsync({ id: item.id, status: item.status === 1 ? 0 : 1 });
      toast.success(item.status === 1 ? "商品已下架" : "商品已上架");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新商品状态失败");
    }
  }

  async function handleDelete(item: ProductPageItem) {
    if (!window.confirm(`确定删除商品「${item.name}」吗？`)) {
      return;
    }
    try {
      await deleteProduct.mutateAsync(item.id);
      toast.success("商品已删除");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除商品失败");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[30px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Products
            </p>
            <h2 className="mt-3 text-2xl font-black">商品管理</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[220px_140px_auto]">
            <Input placeholder="搜索商品名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              <option value="1">上架</option>
              <option value="0">下架</option>
            </Select>
            <Button onClick={() => setOpen(true)}>新增商品</Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] overflow-x-auto">
        <table className="admin-table min-w-[1100px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>商品</th>
              <th>分类</th>
              <th>价格</th>
              <th>库存</th>
              <th>销量</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="flex gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                      <img alt={item.name} className="h-full w-full object-cover" src={item.image || "/favicon.svg"} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-950">{item.name}</div>
                      <div className="text-sm text-slate-500">{item.subtitle || "无副标题"}</div>
                    </div>
                  </div>
                </td>
                <td>{item.categoryName || "-"}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.stock}</td>
                <td>{item.sales}</td>
                <td>
                  <Badge tone={item.status === 1 ? "success" : "neutral"}>
                    {item.status === 1 ? "上架" : "下架"}
                  </Badge>
                </td>
                <td>{formatDateTime(item.createTime)}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void handleEdit(item.id)}>
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
        {!loading && !items.length ? (
          <div className="py-10 text-center text-sm text-slate-500">暂无商品数据</div>
        ) : null}
      </Card>

      <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />

      <Modal
        className="max-w-4xl"
        description="使用高密度表单维护商品基础信息、价格、库存和图片地址。"
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        open={open}
        title={editingId ? "编辑商品" : "新增商品"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">商品名称</label>
            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">副标题</label>
            <Input value={form.subtitle} onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">分类</label>
            <Select value={String(form.categoryId || "")} onChange={(event) => setForm((prev) => ({ ...prev, categoryId: Number(event.target.value) || null }))}>
              <option value="">选择分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="field-label">品牌</label>
            <Input value={form.brand} onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))} />
          </div>
          <div>
            <label className="field-label">原价</label>
            <Input type="number" value={form.originalPrice ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, originalPrice: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">售价</label>
            <Input type="number" value={form.price ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">库存</label>
            <Input type="number" value={form.stock ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value || 0) }))} />
          </div>
          <div>
            <label className="field-label">主图 URL</label>
            <Input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">附加图片</label>
            <Input value={form.images} onChange={(event) => setForm((prev) => ({ ...prev, images: event.target.value }))} placeholder="多张图片使用英文逗号分隔" />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">商品描述</label>
            <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? "保存中..." : "保存商品"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
