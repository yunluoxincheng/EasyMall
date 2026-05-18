"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useFavorites, useRemoveFavorite, useAddToCart } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";

export default function FavoritesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data: favPage } = useFavorites({ pageNum: page, pageSize: 8 });
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddToCart();

  const favorites = favPage?.records ?? [];
  const total = favPage?.total ?? 0;

  async function handleRemove(productId: number, name: string) {
    if (!window.confirm(`确定取消收藏「${name}」吗？`)) return;
    try {
      await removeFavorite.mutateAsync(productId);
      toast.success("已取消收藏");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function handleAddToCart(productId: number) {
    try {
      await addToCart.mutateAsync({ productId, quantity: 1 });
      toast.success("已加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入购物车失败");
    }
  }

  return (
    <AccountShell title="我的收藏" description="你收藏的商品列表">
      {favorites.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow-card">
                <button className="w-full text-left" onClick={() => router.push(`/products/${item.productId}`)} type="button">
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img alt={item.productName} className="h-full w-full object-cover transition hover:scale-105" src={item.productImage || "/favicon.svg"} />
                  </div>
                </button>
                <div className="p-3">
                  <div className="line-clamp-2 text-sm font-medium text-ink">{item.productName}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-bold text-accent">{formatCurrency(item.productPrice)}</div>
                    <Badge tone={item.productStock > 0 ? "success" : "danger"}>
                      {item.productStock > 0 ? `库存 ${item.productStock}` : "已售罄"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1 text-xs h-7" disabled={item.productStock <= 0} onClick={() => void handleAddToCart(item.productId)}>
                      加入购物车
                    </Button>
                    <Button className="flex-1 text-xs h-7" variant="secondary" onClick={() => void handleRemove(item.productId, item.productName)}>
                      取消收藏
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="暂无收藏商品"
          description="去商品详情页收藏感兴趣的商品吧"
          action={{ label: "去浏览商品", onClick: () => router.push("/products") }}
        />
      )}
    </AccountShell>
  );
}
