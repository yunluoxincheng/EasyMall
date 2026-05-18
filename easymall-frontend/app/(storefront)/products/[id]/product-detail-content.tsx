"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MessageSquareText,
  PackagePlus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { storefrontApi } from "@/lib/api";
import {
  useAddToCart,
  useFavoriteCheck,
  useProductCommentCount,
  useProductComments,
  useProductDetail,
  useProductRating,
  useProducts,
  useRelatedProducts,
  useToggleFavorite,
} from "@/lib/hooks";
import {
  formatCurrency,
  formatDateTime,
  formatDiscountLabel,
  formatSalesVolume,
} from "@/lib/format";
import { useSession } from "@/lib/use-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import type { ProductVO } from "@/lib/types";

type SpecGroup = {
  key: string;
  label: string;
  options: string[];
};

function buildSpecGroups(product: ProductVO): SpecGroup[] {
  const colorOptions =
    product.images && product.images.length > 2
      ? ["经典款", "亮色款", "限定款"]
      : ["标准款", "深色款"];

  const storageOptions =
    product.price >= 5000
      ? ["128GB", "256GB", "512GB"]
      : product.price >= 1000
        ? ["标准版", "高配版"]
        : ["单件装", "家庭装"];

  const serviceOptions =
    product.price >= 3000
      ? ["官方标配", "延保一年"]
      : ["官方标配", "会员优享包"];

  return [
    { key: "style", label: "款式", options: colorOptions },
    { key: "edition", label: "版本", options: storageOptions },
    { key: "service", label: "服务", options: serviceOptions },
  ];
}

function CommentSection({
  productId,
  averageRating,
  commentCount,
}: {
  productId: number;
  averageRating: number;
  commentCount: number;
}) {
  const [commentPage, setCommentPage] = useState(1);
  const { data: commentPageData, isLoading } = useProductComments(productId, {
    pageNum: commentPage,
    pageSize: 5,
  });

  const comments = commentPageData?.records ?? [];
  const commentTotal = commentPageData?.total ?? 0;

  if (isLoading) return <LoadingState label="正在加载用户评价..." />;

  return (
    <section className="store-section p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="store-kicker">
            <MessageSquareText className="h-4 w-4" />
            用户评价
          </div>
          <h2 className="mt-2 text-[1.75rem] font-bold text-ink">真实评论与购买反馈</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            用评论和平均评分补足商品决策信息，不让详情页只剩图片和价格。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f6f7fb] px-5 py-4">
            <div className="text-xs text-muted">平均评分</div>
            <div className="mt-1 flex items-center gap-2 text-[1.6rem] font-bold text-ink">
              {averageRating.toFixed(1)}
              <Star className="h-5 w-5 fill-current text-amber-400" />
            </div>
          </div>
          <div className="rounded-2xl bg-[#f6f7fb] px-5 py-4">
            <div className="text-xs text-muted">累计评价</div>
            <div className="mt-1 text-[1.6rem] font-bold text-ink">{commentCount}</div>
          </div>
        </div>
      </div>

      {comments.length ? (
        <div className="mt-5 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-[24px] border border-border bg-[#fbfcfe] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {comment.userNickname || "匿名用户"}
                  </div>
                  <div className="mt-1 text-xs text-muted">{formatDateTime(comment.createTime)}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < comment.rating ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{comment.content}</p>
              {comment.reply ? (
                <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-muted">
                  <span className="font-semibold text-ink">商家回复：</span>
                  {comment.reply}
                </div>
              ) : null}
            </div>
          ))}
          <Pagination page={commentPage} pageSize={5} total={commentTotal} onPageChange={setCommentPage} />
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState title="暂无评价" description="成为第一个留下使用体验的用户吧。" />
        </div>
      )}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f6f7fb] px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ProductMiniCard({
  product,
  actionLabel,
  onAction,
}: {
  product: ProductVO;
  actionLabel?: string;
  onAction?: (product: ProductVO) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-white transition hover:border-[#ffd8c6] hover:shadow-[0_24px_46px_-32px_rgba(16,24,40,0.25)]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f6f7fb]">
          <Image
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]"
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            src={product.image || "/favicon.svg"}
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="line-clamp-2 text-sm font-semibold leading-6 text-ink">{product.name}</div>
        <div className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {product.subtitle || "适合继续比较与搭配的精选商品。"}
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="text-lg font-extrabold text-accent">{formatCurrency(product.price)}</div>
          <div className="text-xs text-muted">已售 {formatSalesVolume(product.sales)}</div>
        </div>
        {actionLabel && onAction ? (
          <Button className="mt-4 h-10 w-full rounded-full" onClick={() => onAction(product)}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SpecSelector({
  groups,
  selectedSpecs,
  onSelect,
}: {
  groups: SpecGroup[];
  selectedSpecs: Record<string, string>;
  onSelect: (groupKey: string, option: string) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-2 text-sm font-semibold text-ink">{group.label}</div>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const active = selectedSpecs[group.key] === option;
              return (
                <button
                  key={option}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-accent text-white"
                      : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
                  }`}
                  onClick={() => onSelect(group.key, option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
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
  const { data: averageRating = 5 } = useProductRating(productId);
  const { data: commentCount = 0 } = useProductCommentCount(productId);
  const { data: relatedProducts = [] } = useRelatedProducts(product?.categoryId || 0, productId, 4);
  const { data: sameBrandPage } = useProducts({
    pageNum: 1,
    pageSize: 8,
    brand: product?.brand || undefined,
    sortBy: "sales",
    sortOrder: "desc",
  });
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedComboIds, setSelectedComboIds] = useState<number[]>([]);

  const images = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(product.images || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  const specGroups = useMemo(() => (product ? buildSpecGroups(product) : []), [product]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  const initializedSpecs = useMemo(() => {
    const base: Record<string, string> = {};
    specGroups.forEach((group) => {
      base[group.key] = selectedSpecs[group.key] || group.options[0];
    });
    return base;
  }, [selectedSpecs, specGroups]);

  const sameBrandProducts = useMemo(() => {
    const records = sameBrandPage?.records ?? [];
    return records.filter((item) => item.id !== productId).slice(0, 4);
  }, [productId, sameBrandPage?.records]);

  const comboProducts = useMemo(() => {
    const pool = [...sameBrandProducts, ...relatedProducts];
    const unique = Array.from(new Map(pool.map((item) => [item.id, item])).values());
    return unique.filter((item) => item.id !== productId).slice(0, 3);
  }, [productId, relatedProducts, sameBrandProducts]);

  const selectedComboProducts = comboProducts.filter((item) => selectedComboIds.includes(item.id));
  const comboTotal = selectedComboProducts.reduce((sum, item) => sum + Number(item.price || 0), Number(product?.price || 0));
  const discountLabel = formatDiscountLabel(product?.originalPrice, product?.price);
  const savings =
    product && Number(product.originalPrice || 0) > Number(product.price || 0)
      ? Number(product.originalPrice) - Number(product.price)
      : 0;

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
    if (!(await requireLogin())) return;
    try {
      const nextValue = await toggleFavorite.mutateAsync(productId);
      toast.success(nextValue ? "已收藏商品" : "已取消收藏");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "收藏操作失败");
    }
  }

  async function handleAddSingleCombo(productItem: ProductVO) {
    if (!(await requireLogin())) return;
    try {
      await addToCart.mutateAsync({ productId: productItem.id, quantity: 1 });
      toast.success("搭配商品已加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入搭配商品失败");
    }
  }

  async function handleAddComboPack() {
    if (!(await requireLogin())) return;
    if (!selectedComboProducts.length) {
      toast.warning("请先选择至少一件搭配商品");
      return;
    }

    try {
      await addToCart.mutateAsync({ productId, quantity });
      for (const combo of selectedComboProducts) {
        await addToCart.mutateAsync({ productId: combo.id, quantity: 1 });
      }
      toast.success("主商品和搭配购商品已全部加入购物车");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入搭配购失败");
    }
  }

  if (isLoading && !product) return <LoadingState label="正在加载商品详情..." />;

  if (!product) {
    return (
      <EmptyState
        title="商品不存在"
        description="该商品可能已经下架，或者链接地址不正确。"
        action={{ label: "返回商品列表", onClick: () => router.push("/products") }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="store-section overflow-hidden p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[32px] bg-[#f6f7fb]">
              <Image
                alt={product.name}
                className="h-full w-full object-cover"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 50vw"
                src={images[imageIndex] || product.image || "/favicon.svg"}
              />
            </div>
            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={`relative aspect-square overflow-hidden rounded-[20px] border-2 transition ${
                      index === imageIndex ? "border-accent" : "border-transparent hover:border-[#ffd8c6]"
                    }`}
                    onClick={() => setImageIndex(index)}
                    type="button"
                  >
                    <Image
                      alt={`${product.name}-${index + 1}`}
                      className="h-full w-full object-cover"
                      fill
                      sizes="120px"
                      src={image}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#252f43)] p-6 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent" className="rounded-full bg-white/12 px-3 py-1 text-white">
                  {product.categoryName || "精选商品"}
                </Badge>
                {discountLabel ? (
                  <Badge tone="warning" className="rounded-full bg-[#fff0d5] px-3 py-1 text-[#9a5b00]">
                    {discountLabel}
                  </Badge>
                ) : null}
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  品牌 {product.brand || "官方精选"}
                </span>
              </div>

              <h1 className="mt-4 text-[2rem] font-extrabold leading-tight">{product.name}</h1>
              <p className="mt-3 text-sm leading-7 text-white/76">
                {product.subtitle || "围绕价格、品质与售后体验设计的商品详情页，帮助用户更快形成购买决策。"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs text-white/64">平均评分</div>
                  <div className="mt-1 flex items-center gap-2 text-xl font-bold">
                    {averageRating.toFixed(1)}
                    <Star className="h-5 w-5 fill-current text-amber-400" />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs text-white/64">累计评价</div>
                  <div className="mt-1 text-xl font-bold">{commentCount}</div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="text-xs text-white/64">销量</div>
                  <div className="mt-1 text-xl font-bold">{formatSalesVolume(product.sales)}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#fff7f2] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                到手价
              </div>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <div className="text-[2.3rem] font-extrabold text-accent">
                  {formatCurrency(product.price)}
                </div>
                {product.originalPrice > product.price ? (
                  <div className="pb-2 text-sm text-muted line-through">
                    {formatCurrency(product.originalPrice)}
                  </div>
                ) : null}
              </div>
              {savings > 0 ? (
                <div className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent">
                  立省 {formatCurrency(savings)}
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <MetaRow label="库存状态" value={product.stock > 0 ? `${product.stock} 件可售` : "暂时缺货"} />
                <MetaRow label="发货时效" value={product.stock > 0 ? "48 小时内发货" : "到货后通知"} />
                <MetaRow label="创建时间" value={formatDateTime(product.createTime)} />
                <MetaRow label="服务承诺" value="支持价保、退换与正品保障" />
              </div>
            </div>

            <div className="store-section p-5">
              <div className="text-base font-semibold text-ink">规格选择与购买设置</div>
              <p className="mt-2 text-sm leading-7 text-muted">
                当前规格为前端购买配置，用于帮助用户形成购买决策，不依赖额外规格接口。
              </p>

              <div className="mt-4">
                <SpecSelector
                  groups={specGroups}
                  selectedSpecs={initializedSpecs}
                  onSelect={(groupKey, option) =>
                    setSelectedSpecs((prev) => ({ ...prev, [groupKey]: option }))
                  }
                />
              </div>

              <div className="mt-5 rounded-[22px] bg-[#f6f7fb] px-4 py-4 text-sm text-ink">
                已选：
                <span className="ml-2 font-semibold">
                  {specGroups.map((group) => initializedSpecs[group.key]).join(" / ")}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-4">
                <div>
                  <label className="field-label">购买数量</label>
                  <div className="flex h-11 items-center overflow-hidden rounded-full border border-border bg-white">
                    <button
                      className="h-full w-11 text-lg text-ink transition hover:bg-accent-light hover:text-accent"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      type="button"
                    >
                      -
                    </button>
                    <div className="flex h-full min-w-12 items-center justify-center px-3 text-sm font-semibold text-ink">
                      {quantity}
                    </div>
                    <button
                      className="h-full w-11 text-lg text-ink transition hover:bg-accent-light hover:text-accent"
                      onClick={() => setQuantity((prev) => Math.min(Math.max(product.stock, 1), prev + 1))}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button className="h-12 rounded-full px-6" disabled={product.stock <= 0} onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  加入购物车
                </Button>
                <Button className="h-12 rounded-full px-6" disabled={product.stock <= 0} onClick={handleBuyNow} variant="secondary">
                  立即购买
                </Button>
                <Button className="h-12 rounded-full px-5" onClick={handleFavorite} variant="ghost">
                  <Heart className={`mr-2 h-4 w-4 ${favorite ? "fill-current text-accent" : ""}`} />
                  {favorite ? "已收藏" : "收藏商品"}
                </Button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  { title: "官方精选", description: "商品信息、陈列与活动标签统一呈现", icon: Store },
                  { title: "正品保障", description: "支持售后与品质承诺说明", icon: ShieldCheck },
                  { title: "履约体验", description: "库存、发货与购买流程同步清晰展示", icon: Truck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[22px] bg-[#f6f7fb] p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="mt-3 text-sm font-semibold text-ink">{item.title}</div>
                      <div className="mt-1 text-sm leading-6 text-muted">{item.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="store-section p-6">
          <div className="store-kicker">
            <Store className="h-4 w-4" />
            商品详情
          </div>
          <h2 className="mt-2 text-[1.75rem] font-bold text-ink">商品描述与购买理由</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-muted">
            {product.description || "暂无详细描述，当前商品以品质、价格与服务保障为主要卖点。"}
          </p>
        </section>

        <section className="store-section p-6">
          <div className="store-kicker">
            <SparklineIcon />
            购买建议
          </div>
          <h2 className="mt-2 text-[1.75rem] font-bold text-ink">快速做决策的几个关键信息</h2>
          <div className="mt-4 space-y-3">
            {[
              `当前售价 ${formatCurrency(product.price)}，${savings > 0 ? `比原价节省 ${formatCurrency(savings)}` : "目前价格稳定"}`,
              `销量已达 ${formatSalesVolume(product.sales)}，当前${product.stock > 0 ? `库存 ${product.stock} 件` : "暂时缺货"}`,
              `已有 ${commentCount} 条评价，平均评分 ${averageRating.toFixed(1)} 分`,
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#f6f7fb] px-4 py-3 text-sm leading-7 text-ink">
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
          >
            返回继续挑选
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </section>

      <section className="store-section p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="store-kicker">
              <PackagePlus className="h-4 w-4" />
              搭配购
            </div>
            <h2 className="mt-2 text-[1.75rem] font-bold text-ink">把常见搭配一起加入购物车</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              用关联商品和同品牌商品组成轻量搭配购，帮助用户从单品浏览走向组合加购。
            </p>
          </div>
          <div className="rounded-[22px] bg-[#fff7f2] px-4 py-3 text-right">
            <div className="text-xs text-muted">组合到手价</div>
            <div className="mt-1 text-xl font-extrabold text-accent">{formatCurrency(comboTotal)}</div>
          </div>
        </div>

        {comboProducts.length ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {comboProducts.map((item) => {
                const checked = selectedComboIds.includes(item.id);
                return (
                  <div key={item.id} className={`rounded-[24px] border p-4 transition ${checked ? "border-accent bg-accent-light/50" : "border-border bg-white"}`}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        checked={checked}
                        className="mt-1 h-4 w-4 accent-accent"
                        onChange={(event) => {
                          setSelectedComboIds((prev) =>
                            event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                          );
                        }}
                        type="checkbox"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink">{item.name}</div>
                        <div className="mt-1 text-sm text-muted">{item.brand || item.categoryName || "精选搭配"}</div>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div className="text-lg font-extrabold text-accent">{formatCurrency(item.price)}</div>
                          <button
                            className="text-sm font-semibold text-accent transition hover:text-accent-strong"
                            onClick={() => void handleAddSingleCombo(item)}
                            type="button"
                          >
                            单独加购
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-[#f6f7fb] px-5 py-4">
              <div className="text-sm text-ink">
                已选搭配商品
                <span className="ml-2 font-semibold">{selectedComboProducts.length}</span>
                <span className="ml-4 text-muted">主商品 + 搭配购更适合一次性完成组合加购</span>
              </div>
              <Button className="rounded-full px-6" onClick={handleAddComboPack}>
                一键加入搭配购
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-5">
            <EmptyState title="暂无搭配购商品" description="等更多关联商品补充后，这里会展示推荐组合。" />
          </div>
        )}
      </section>

      <CommentSection productId={productId} averageRating={averageRating} commentCount={commentCount} />

      <section className="store-section p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="store-kicker">
              <Sparkles className="h-4 w-4" />
              同品牌推荐
            </div>
            <h2 className="mt-2 text-[1.75rem] font-bold text-ink">继续逛这个品牌的热门商品</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              对已经形成品牌偏好的用户来说，同品牌推荐往往比泛推荐更容易带来继续浏览和加购。
            </p>
          </div>
          {product.brand ? (
            <Link
              href={`/brands?brand=${encodeURIComponent(product.brand)}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              进入品牌会场
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sameBrandProducts.length ? (
            sameBrandProducts.map((item) => <ProductMiniCard key={item.id} product={item} />)
          ) : (
            <div className="sm:col-span-2 xl:col-span-4">
              <EmptyState title="暂无同品牌推荐" description="等更多同品牌商品同步后，这里会展示更完整的品牌推荐。" />
            </div>
          )}
        </div>
      </section>

      <section className="store-section p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="store-kicker">
              <ShoppingCart className="h-4 w-4" />
              相关推荐
            </div>
            <h2 className="mt-2 text-[1.75rem] font-bold text-ink">继续逛同类好物</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              根据当前分类推荐更多商品，补足从详情页继续浏览的路径。
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            查看更多商品
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.length ? (
            relatedProducts.map((item) => <ProductMiniCard key={item.id} product={item} />)
          ) : (
            <div className="sm:col-span-2 xl:col-span-4">
              <EmptyState title="暂无相关推荐" description="可以返回列表页查看更多同类商品。" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SparklineIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 16L9 11L13 14L20 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M16 7H20V11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
