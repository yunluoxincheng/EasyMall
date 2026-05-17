"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { storefrontApi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { CartVO } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartVO[]>([]);

  useEffect(() => {
    void loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const data = await storefrontApi.getCartList();
      setCartItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "获取购物车失败");
    } finally {
      setLoading(false);
    }
  }

  const selectedItems = useMemo(
    () => cartItems.filter((item) => item.selected),
    [cartItems],
  );

  const allSelected = useMemo(
    () => cartItems.length > 0 && selectedItems.length === cartItems.length,
    [cartItems.length, selectedItems.length],
  );

  const totalPrice = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [selectedItems],
  );

  async function handleSelectAll(nextValue: boolean) {
    try {
      await storefrontApi.selectAllCart(nextValue);
      await loadCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function handleSelectOne(item: CartVO, selected: boolean) {
    try {
      await storefrontApi.batchSelectCart(selected, [item.id]);
      await loadCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function handleQuantityChange(item: CartVO, quantity: number) {
    try {
      await storefrontApi.updateCartItem(item.id, quantity);
      await loadCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改数量失败");
    }
  }

  async function handleDelete(item: CartVO) {
    if (!window.confirm(`确定要删除「${item.productName}」吗？`)) {
      return;
    }

    try {
      await storefrontApi.deleteCartItem(item.id);
      toast.success("删除成功");
      await loadCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  function handleCheckout() {
    if (!selectedItems.length) {
      toast.warning("请先选择至少一件商品");
      return;
    }
    router.push(`/checkout?cartIds=${selectedItems.map((item) => item.id).join(",")}`);
  }

  if (loading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载购物车..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute requireAuth>
      {cartItems.length ? (
        <div className="space-y-5 pb-28">
          <Card className="rounded-[34px]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Cart
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  购物车管理
                </h1>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  checked={allSelected}
                  onChange={(event) => handleSelectAll(event.target.checked)}
                  type="checkbox"
                />
                全选
              </label>
            </div>
          </Card>

          {cartItems.map((item) => (
            <Card key={item.id} className="rounded-[30px]">
              <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_180px_180px_140px] lg:items-center">
                <div className="flex items-center gap-3">
                  <input
                    checked={item.selected}
                    onChange={(event) => handleSelectOne(item, event.target.checked)}
                    type="checkbox"
                  />
                  <div className="h-24 w-24 overflow-hidden rounded-[24px] bg-slate-100">
                    <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                  </div>
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-950">{item.productName}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    支持数量调整、选择结算和单项删除。
                  </p>
                  <div className="mt-4 text-sm text-slate-500">
                    库存：{item.stock} · 单价：{formatCurrency(item.productPrice)}
                  </div>
                </div>

                <div>
                  <label className="field-label">数量</label>
                  <input
                    className="h-11 w-full rounded-2xl border border-[var(--border)] px-4"
                    max={item.stock}
                    min={1}
                    type="number"
                    value={item.quantity}
                    onChange={(event) => handleQuantityChange(item, Number(event.target.value || "1"))}
                  />
                </div>

                <div>
                  <div className="field-label">小计</div>
                  <div className="text-xl font-black text-rose-600">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>

                <div className="flex justify-start lg:justify-end">
                  <Button variant="ghost" onClick={() => handleDelete(item)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <div className="fixed bottom-4 left-1/2 z-20 flex w-[min(1200px,calc(100%-2rem))] -translate-x-1/2 items-center justify-between rounded-[28px] border border-white/70 bg-white/95 px-5 py-4 shadow-panel backdrop-blur">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input checked={allSelected} onChange={(event) => handleSelectAll(event.target.checked)} type="checkbox" />
              全选
            </label>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                已选 <span className="font-bold text-slate-900">{selectedItems.length}</span> 件
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  合计
                </div>
                <div className="text-2xl font-black text-rose-600">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
              <Button onClick={handleCheckout}>去结算</Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="购物车还是空的"
          description="你还没有把商品加入购物车。先去商品列表逛逛，再回来结算。"
          action={{
            label: "去逛商品",
            onClick: () => router.push("/products"),
          }}
        />
      )}
    </ProtectedRoute>
  );
}
