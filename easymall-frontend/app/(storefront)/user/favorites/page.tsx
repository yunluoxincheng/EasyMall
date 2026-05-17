"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AccountShell } from "@/components/layout/account-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <AccountShell
      title="我的收藏"
      description="保留收藏列表、取消收藏和加入购物车入口，方便用户从收藏夹继续完成购买。"
    >
      {favorites.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <Card key={item.id} className="rounded-[30px]">
                <button className="w-full text-left" onClick={() => router.push(`/products/${item.productId}`)} type="button">
                  <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
                    <img alt={item.productName} className="h-full w-full object-cover" src={item.productImage || "/favicon.svg"} />
                  </div>
                  <h2 className="mt-4 text-lg font-black text-slate-950">{item.productName}</h2>
                </button>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-black text-rose-600">
                    {formatCurrency(item.productPrice)}
                  </div>
                  <Badge tone={item.productStock > 0 ? "success" : "danger"}>
                    {item.productStock > 0 ? `库存 ${item.productStock}` : "已售罄"}
                  </Badge>
                </div>
                <div className="mt-5 flex gap-3">
                  <Button className="flex-1" disabled={item.productStock <= 0} onClick={() => void handleAddToCart(item.productId)}>
                    加入购物车
                  </Button>
                  <Button className="flex-1" variant="secondary" onClick={() => void handleRemove(item.productId, item.productName)}>
                    取消收藏
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination page={page} pageSize={8} total={total} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState
          title="暂无收藏商品"
          description="先去商品详情页点一点收藏，再回来整理你的关注列表。"
          action={{
            label: "去浏览商品",
            onClick: () => router.push("/products"),
          }}
        />
      )}
    </AccountShell>
  );
}
