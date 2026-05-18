"use client";

import { useRouter } from "next/navigation";
import { Heart, MessageSquareText, ShoppingCart, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import {
  useProductDetail,
  useProductComments,
  useFavoriteCheck,
  useAddToCart,
  useToggleFavorite,
} from "@/lib/hooks";
import { storefrontApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { ProductVO } from "@/lib/types";

function CommentSection({ productId }: { productId: number }) {
  const [commentPage, setCommentPage] = useState(1);
  const { data: commentPageData, isLoading } = useProductComments(productId, {
    pageNum: commentPage,
    pageSize: 5,
  });

  const comments = commentPageData?.records ?? [];
  const commentTotal = commentPageData?.total ?? 0;

  if (isLoading) return <LoadingState label="正在加载评论..." />;

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">用户评价</h2>
          <p className="text-xs text-muted">共 {commentTotal} 条评论</p>
        </div>
        <MessageSquareText className="h-4 w-4 text-muted" />
      </div>

      {comments.length ? (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-ink">{comment.userNickname || "匿名用户"}</div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < comment.rating ? "fill-current" : ""}`} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{comment.content}</p>
              {comment.reply ? (
                <div className="mt-2 rounded-md bg-white p-3 text-sm text-muted">
                  <span className="font-medium text-ink">商家回复：</span>{comment.reply}
                </div>
              ) : null}
              <div className="mt-2 text-xs text-muted">{formatDateTime(comment.createTime)}</div>
            </div>
          ))}
          <Pagination page={commentPage} pageSize={5} total={commentTotal} onPageChange={setCommentPage} />
        </div>
      ) : (
        <EmptyState title="暂无评价" description="成为第一个评价的用户吧" />
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ProductDetailContent({
  serverProduct,
  productId,
}: {
  serverProduct: ProductVO | null;
  productId: number;
}) {
  const router = useRouter();
  const session = useSession();

  const { data: product = serverProduct, isLoading } = useProductDetail(productId);
  const { data: favorite = false } = useFavoriteCheck(productId, session.isLoggedIn);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(product.images || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  async function requireLogin() {
    if (session.isLoggedIn) return true;
    router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
    return false;
  }

  async function handleAddToCart() {
    if (!(await requireLogin())) return;
    try {
      await addToCart.mutateAsync({ productId, quantity });
      toast.success("已加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入购物车失败");
    }
  }

  async function handleBuyNow() {
    if (!(await requireLogin())) return;
    try {
      await addToCart.mutateAsync({ productId, quantity });
      const cart = await storefrontApi.getCartList();
      const target = cart.find((item) => item.productId === productId);
      if (!target) { toast.error("未找到对应的购物车记录"); return; }
      router.push(`/checkout?cartIds=${target.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "立即购买失败");
    }
  }

  async function handleFavorite() {
    if (!(await requireLogin())) return;
    try {
      const nextValue = await toggleFavorite.mutateAsync(productId);
      toast.success(nextValue ? "已收藏商品" : "已取消收藏");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "收藏操作失败");
    }
  }

  if (isLoading && !product) return <LoadingState label="正在加载商品详情..." />;

  if (!product) {
    return (
      <EmptyState
        title="商品不存在"
        description="该商品可能已下架或链接不正确"
        action={{ label: "返回商品列表", onClick: () => router.push("/products") }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Product main info */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Images */}
        <div className="rounded-lg bg-white p-4 shadow-card">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-50">
            <img alt={product.name} className="h-full w-full object-cover" src={images[imageIndex] || product.image || "/favicon.svg"} />
          </div>
          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} className={`overflow-hidden rounded-md border-2 ${index === imageIndex ? "border-accent" : "border-transparent"}`} onClick={() => setImageIndex(index)} type="button">
                  <img alt={`${product.name}-${index + 1}`} className="h-16 w-full object-cover" src={image} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="rounded-lg bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{product.categoryName || "精选商品"}</Badge>
            <span className="text-xs text-muted">已售 {product.sales}</span>
            <span className="text-xs text-muted">库存 {product.stock}</span>
          </div>
          <h1 className="mt-3 text-xl font-semibold text-ink">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">{product.subtitle || "品质保障，放心购买"}</p>

          {/* Price */}
          <div className="mt-4 rounded-lg bg-accent-light px-4 py-3">
            <div className="text-xs text-accent">当前售价</div>
            <div className="mt-1 text-2xl font-bold text-accent">{formatCurrency(product.price)}</div>
            {product.originalPrice > product.price ? (
              <div className="mt-1 text-xs text-muted line-through">原价 {formatCurrency(product.originalPrice)}</div>
            ) : null}
          </div>

          {/* Meta */}
          <dl className="mt-4 grid gap-2 rounded-lg border border-border bg-gray-50 p-3 sm:grid-cols-2">
            <MetaRow label="品牌" value={product.brand || "未配置"} />
            <MetaRow label="分类" value={product.categoryName || "未分类"} />
            <MetaRow label="发布时间" value={formatDateTime(product.createTime)} />
            <MetaRow label="库存状态" value={product.stock > 0 ? "可购买" : "已售罄"} />
          </dl>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div>
              <label className="field-label">数量</label>
              <input
                min={1}
                max={Math.max(1, product.stock)}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value || "1"), Math.max(product.stock, 1))))}
                className="h-9 w-24 rounded-lg border border-border px-3 text-sm"
              />
            </div>
            <Button disabled={product.stock <= 0} onClick={handleAddToCart}>
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              加入购物车
            </Button>
            <Button disabled={product.stock <= 0} variant="secondary" onClick={handleBuyNow}>
              立即购买
            </Button>
            <Button variant="ghost" onClick={handleFavorite}>
              <Heart className={`mr-1.5 h-4 w-4 ${favorite ? "fill-current text-accent" : ""}`} />
              {favorite ? "已收藏" : "收藏"}
            </Button>
          </div>

          {/* Description */}
          <div className="mt-4 rounded-lg border border-border bg-gray-50 p-3">
            <h2 className="text-sm font-semibold text-ink">商品描述</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{product.description || "暂无详细描述"}</p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentSection productId={productId} />
    </div>
  );
}
