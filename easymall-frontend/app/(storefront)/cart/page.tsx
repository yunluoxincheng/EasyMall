"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCartList, useUpdateCartItem, useDeleteCartItem, useSelectAllCart, useBatchSelectCart } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";
import type { CartVO } from "@/lib/types";

function CartItemRow({
  item,
  onUpdateQuantity,
  onDelete,
  onSelect,
}: {
  item: CartVO;
  onUpdateQuantity: (item: CartVO, quantity: number) => void;
  onDelete: (item: CartVO) => void;
  onSelect: (item: CartVO, selected: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 transition hover:shadow-card">
      <input
        checked={item.selected}
        onChange={(event) => onSelect(item, event.target.checked)}
        type="checkbox"
        className="h-4 w-4 accent-accent"
      />
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
        <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-medium text-ink">{item.productName}</h2>
        <div className="mt-1 text-xs text-muted">
          库存：{item.stock} · 单价：{formatCurrency(item.productPrice)}
        </div>
      </div>
      <div className="shrink-0">
        <input
          className="h-8 w-20 rounded-md border border-border px-2 text-center text-sm"
          max={item.stock}
          min={1}
          type="number"
          value={item.quantity}
          onChange={(event) => onUpdateQuantity(item, Number(event.target.value || "1"))}
        />
      </div>
      <div className="shrink-0 w-24 text-right">
        <div className="text-sm font-bold text-accent">{formatCurrency(item.totalPrice)}</div>
      </div>
      <Button variant="ghost" className="shrink-0 h-8 w-8 p-0" onClick={() => onDelete(item)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { data: cartItems = [], isLoading } = useCartList();
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();
  const selectAllCart = useSelectAllCart();
  const batchSelectCart = useBatchSelectCart();

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

  async function handleQuantityChange(item: CartVO, quantity: number) {
    try {
      await updateCartItem.mutateAsync({ cartId: item.id, quantity });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改数量失败");
    }
  }

  async function handleDelete(item: CartVO) {
    if (!window.confirm(`确定要删除「${item.productName}」吗？`)) return;
    try {
      await deleteCartItem.mutateAsync(item.id);
      toast.success("删除成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function handleSelectAll(nextValue: boolean) {
    try {
      await selectAllCart.mutateAsync(nextValue);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function handleSelectOne(item: CartVO, selected: boolean) {
    try {
      await batchSelectCart.mutateAsync({ selected, cartIds: [item.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  function handleCheckout() {
    if (!selectedItems.length) {
      toast.warning("请先选择至少一件商品");
      return;
    }
    router.push(`/checkout?cartIds=${selectedItems.map((item) => item.id).join(",")}`);
  }

  if (isLoading) {
    return <ProtectedRoute requireAuth><LoadingState label="正在加载购物车..." /></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      {cartItems.length ? (
        <div className="space-y-3 pb-24">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-card">
            <div>
              <h1 className="text-lg font-semibold text-ink">我的购物车</h1>
              <p className="text-xs text-muted">共 {cartItems.length} 件商品</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                checked={allSelected}
                onChange={(event) => handleSelectAll(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 accent-accent"
              />
              全选
            </label>
          </div>

          {cartItems.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={handleQuantityChange}
              onDelete={handleDelete}
              onSelect={handleSelectOne}
            />
          ))}

          {/* Bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white px-4 py-3 shadow-header">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-muted">
                <input checked={allSelected} onChange={(event) => handleSelectAll(event.target.checked)} type="checkbox" className="h-4 w-4 accent-accent" />
                全选
              </label>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted">
                  已选 <span className="font-semibold text-ink">{selectedItems.length}</span> 件
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted">合计：</span>
                  <span className="text-lg font-bold text-accent">{formatCurrency(totalPrice)}</span>
                </div>
                <Button onClick={handleCheckout}>去结算</Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="购物车还是空的"
          description="还没有把商品加入购物车，先去商品列表逛逛吧"
          action={{
            label: "去逛商品",
            onClick: () => router.push("/products"),
          }}
        />
      )}
    </ProtectedRoute>
  );
}
