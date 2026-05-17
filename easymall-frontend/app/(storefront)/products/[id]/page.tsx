"use client";

import { useParams, useRouter } from "next/navigation";
import { Heart, MessageSquareText, ShoppingCart, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { storefrontApi } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import type { ProductVO, UserCommentVO } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();
  const productId = Number(params.id);

  const [product, setProduct] = useState<ProductVO | null>(null);
  const [comments, setComments] = useState<UserCommentVO[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [productData, commentPageData] = await Promise.all([
          storefrontApi.getProductById(productId),
          storefrontApi.getProductComments(productId, {
            pageNum: commentPage,
            pageSize: 5,
          }),
        ]);

        const favoriteState = session.isLoggedIn
          ? await storefrontApi.checkFavorite(productId).catch(() => false)
          : false;

        if (!cancelled) {
          setProduct(productData);
          setComments(commentPageData.records);
          setCommentTotal(commentPageData.total);
          setFavorite(favoriteState);
          setImageIndex(0);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "获取商品详情失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [commentPage, productId, session.isLoggedIn]);

  const images = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(product.images || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  async function requireLogin() {
    if (session.isLoggedIn) {
      return true;
    }
    router.push(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
    return false;
  }

  async function handleAddToCart() {
    if (!(await requireLogin())) {
      return;
    }

    try {
      await storefrontApi.addToCart(productId, quantity);
      toast.success("已加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入购物车失败");
    }
  }

  async function handleBuyNow() {
    if (!(await requireLogin())) {
      return;
    }

    try {
      await storefrontApi.addToCart(productId, quantity);
      const cart = await storefrontApi.getCartList();
      const target = cart.find((item) => item.productId === productId);
      if (!target) {
        toast.error("未找到对应的购物车记录");
        return;
      }
      router.push(`/checkout?cartIds=${target.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "立即购买失败");
    }
  }

  async function handleFavorite() {
    if (!(await requireLogin())) {
      return;
    }

    try {
      const nextValue = await storefrontApi.toggleFavorite(productId);
      setFavorite(nextValue);
      toast.success(nextValue ? "已收藏商品" : "已取消收藏");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "收藏操作失败");
    }
  }

  if (loading) {
    return <LoadingState label="正在加载商品详情..." />;
  }

  if (!product) {
    return (
      <EmptyState
        title="商品不存在"
        description="当前商品可能已经下架，或者访问链接不正确。"
        action={{
          label: "返回商品列表",
          onClick: () => router.push("/products"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="rounded-[34px]">
          <div className="aspect-square overflow-hidden rounded-[28px] bg-slate-100">
            <img
              alt={product.name}
              className="h-full w-full object-cover"
              src={images[imageIndex] || product.image || "/favicon.svg"}
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={`overflow-hidden rounded-2xl border ${
                    index === imageIndex ? "border-emerald-500" : "border-transparent"
                  }`}
                  onClick={() => setImageIndex(index)}
                  type="button"
                >
                  <img alt={`${product.name}-${index + 1}`} className="h-20 w-full object-cover" src={image} />
                </button>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="rounded-[34px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {product.categoryName || "精选商品"}
            </span>
            <span className="text-sm text-slate-500">已售 {product.sales}</span>
            <span className="text-sm text-slate-500">库存 {product.stock}</span>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
            {product.name}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {product.subtitle || "支持购物车加入、立即购买、收藏和评论浏览。"}
          </p>

          <div className="mt-6 rounded-[28px] bg-rose-50 px-6 py-5">
            <div className="text-sm font-semibold text-rose-700">当前售价</div>
            <div className="mt-2 text-4xl font-black text-rose-600">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice > product.price ? (
              <div className="mt-2 text-sm text-slate-400 line-through">
                原价 {formatCurrency(product.originalPrice)}
              </div>
            ) : null}
          </div>

          <dl className="mt-6 grid gap-3 rounded-[28px] border border-[var(--border)] bg-slate-50 p-5 md:grid-cols-2">
            <MetaRow label="品牌" value={product.brand || "未配置"} />
            <MetaRow label="分类" value={product.categoryName || "未分类"} />
            <MetaRow label="发布时间" value={formatDateTime(product.createTime)} />
            <MetaRow label="库存状态" value={product.stock > 0 ? "可购买" : "已售罄"} />
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <label className="field-label">购买数量</label>
              <input
                min={1}
                max={Math.max(1, product.stock)}
                type="number"
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Math.min(Number(event.target.value || "1"), Math.max(product.stock, 1))))
                }
                className="h-11 w-28 rounded-2xl border border-[var(--border)] px-4"
              />
            </div>
            <Button disabled={product.stock <= 0} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              加入购物车
            </Button>
            <Button disabled={product.stock <= 0} onClick={handleBuyNow} variant="secondary">
              立即购买
            </Button>
            <Button onClick={handleFavorite} variant="ghost">
              <Heart className={`mr-2 h-4 w-4 ${favorite ? "fill-current" : ""}`} />
              {favorite ? "已收藏" : "收藏商品"}
            </Button>
          </div>

          <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-white p-5">
            <h2 className="text-lg font-black">商品描述</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">
              {product.description || "暂无详细描述。"}
            </p>
          </div>
        </Card>
      </div>

      <Card className="rounded-[34px]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">用户评价</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              共 {commentTotal} 条评论，支持查看评分、内容和商家回复。
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MessageSquareText className="h-4 w-4" />
            评论区
          </div>
        </div>

        {comments.length ? (
          <div className="mt-6 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-[26px] border border-[var(--border)] bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold text-slate-900">
                    {comment.userNickname || "匿名用户"}
                  </div>
                  <div className="flex items-center gap-2 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < comment.rating ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{comment.content}</p>
                {comment.reply ? (
                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">商家回复：</span>
                    {comment.reply}
                  </div>
                ) : null}
                <div className="mt-4 text-xs text-slate-400">
                  {formatDateTime(comment.createTime)}
                </div>
              </div>
            ))}
            <Pagination
              page={commentPage}
              pageSize={5}
              total={commentTotal}
              onPageChange={setCommentPage}
            />
          </div>
        ) : (
          <EmptyState
            title="暂无评价"
            description="首版详情页会保留评论入口和商家回复展示，后续可继续增强图片评论等能力。"
          />
        )}
      </Card>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
