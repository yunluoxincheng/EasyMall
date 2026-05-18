"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useAddToCart, useFavorites, useRemoveFavorite } from "@/lib/hooks";
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
    <AccountShell title="我的收藏" description="把感兴趣的商品先收进收藏夹，再决定什么时候加入购物车。">
      {favorites.length ? (
        <div className="space-y-4">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <div key={item.id} className="store-section overflow-hidden">
                <button className="w-full text-left" onClick={() => router.push(`/products/${item.productId}`)} type="button">
                  <div className="relative aspect-square overflow-hidden bg-[#f6f7fb]">
                    <Image
                      alt={item.productName}
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={item.productImage || "/favicon.svg"}
                    />
                  </div>
                </button>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="line-clamp-2 text-base font-semibold text-ink">{item.productName}</div>
                    <Badge tone={item.productStock > 0 ? "success" : "danger"}>
                      {item.productStock > 0 ? `库存 ${item.productStock}` : "已售罄"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="text-2xl font-extrabold text-accent">{formatCurrency(item.productPrice)}</div>
                    <div className="rounded-full bg-[#f6f7fb] px-3 py-1 text-xs text-muted">收藏好物</div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button className="h-11 flex-1 rounded-full" disabled={item.productStock <= 0} onClick={() => void handleAddToCart(item.productId)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      加入购物车
                    </Button>
                    <Button className="h-11 flex-1 rounded-full" variant="secondary" onClick={() => void handleRemove(item.productId, item.productName)}>
                      <Heart className="mr-2 h-4 w-4" />
                      取消收藏
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </section>
          <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          title="暂无收藏商品"
          description="去商品详情页收藏感兴趣的商品吧。"
          action={{ label: "去浏览商品", onClick: () => router.push("/products") }}
        />
      )}
    </AccountShell>
  );
}
