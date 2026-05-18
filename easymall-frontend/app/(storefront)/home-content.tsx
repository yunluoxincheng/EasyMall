"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gem,
  Home,
  MonitorSmartphone,
  Package,
  Popcorn,
  Shirt,
  Sparkles,
  TicketPercent,
  Trophy,
  Tv,
  Umbrella,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useCategoryTree, useHotProducts, useNewProducts } from "@/lib/hooks";
import { formatCurrency } from "@/lib/format";
import type { CategoryVO, ProductVO } from "@/lib/types";

const fallbackCategories = [
  "女装上新", "手机数码", "家用电器", "家居生活", "美妆个护",
  "食品生鲜", "运动户外", "母婴玩具", "珠宝配饰", "图书文娱",
];

const categoryDecorators = [
  { icon: Shirt, tags: ["春夏", "上新", "精选"] },
  { icon: MonitorSmartphone, tags: ["电脑", "配件", "办公"] },
  { icon: Tv, tags: ["品质", "节能", "换新"] },
  { icon: Home, tags: ["家具", "家装", "厨具"] },
  { icon: Sparkles, tags: ["香氛", "护肤", "彩妆"] },
  { icon: Popcorn, tags: ["零食", "鲜果", "酒饮"] },
  { icon: Umbrella, tags: ["女鞋", "男鞋", "户外"] },
  { icon: Package, tags: ["童装", "童鞋", "用品"] },
  { icon: Gem, tags: ["黄金", "饰品", "腕表"] },
  { icon: Cpu, tags: ["图书", "文创", "娱乐"] },
];

const bannerSlides = [
  {
    title: "春季焕新季",
    subtitle: "新品首发，限时特惠",
    color: "from-[#ff5000] to-[#ff7a33]",
  },
  {
    title: "品质好物节",
    subtitle: "精选好货，一站购齐",
    color: "from-[#e83e3e] to-[#ff6b6b]",
  },
  {
    title: "会员专享日",
    subtitle: "积分翻倍，优惠不停",
    color: "from-[#d4380d] to-[#ff5000]",
  },
];

const promoItems = [
  { title: "限时秒杀", desc: "每日10点开抢", icon: Trophy, color: "bg-red-50 text-red-500" },
  { title: "品质好货", desc: "严选好物推荐", icon: Sparkles, color: "bg-amber-50 text-amber-600" },
  { title: "领券中心", desc: "领券立享优惠", icon: TicketPercent, color: "bg-blue-50 text-blue-500" },
  { title: "积分兑换", desc: "积分当钱花", icon: Gem, color: "bg-green-50 text-green-600" },
];

export function HomeContent({
  serverCategories,
  serverHotProducts,
  serverNewProducts,
}: {
  serverCategories: CategoryVO[];
  serverHotProducts: ProductVO[];
  serverNewProducts: ProductVO[];
}) {
  const { data: categories = serverCategories } = useCategoryTree();
  const { data: hotProducts = serverHotProducts } = useHotProducts(10);
  const { data: newProducts = serverNewProducts } = useNewProducts(10);

  const mergedProducts = useMemo(() => {
    const deduped = new Map<number, ProductVO>();
    [...hotProducts, ...newProducts].forEach((p) => deduped.set(p.id, p));
    return Array.from(deduped.values());
  }, [hotProducts, newProducts]);

  const displayCategories = categories.length
    ? categories.slice(0, 10).map((item) => item.name)
    : fallbackCategories;

  const categoryRows = displayCategories.map((name, index) => ({
    name,
    icon: categoryDecorators[index % categoryDecorators.length].icon,
    tags: categoryDecorators[index % categoryDecorators.length].tags,
  }));

  const productFlow = mergedProducts.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Hero: Category sidebar + Carousel */}
      <section className="grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)]">
        <CategorySidebar rows={categoryRows} />
        <div className="space-y-3">
          <HeroCarousel />
          {/* Promo quick links */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {promoItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.title === "领券中心" ? "/coupons" : item.title === "积分兑换" ? "/user/points/products" : "/products"}
                  className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card transition hover:shadow-float"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{item.title}</div>
                    <div className="text-xs text-muted">{item.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product flow */}
      <ProductFlowSection products={productFlow} />
    </div>
  );
}

function CategorySidebar({ rows }: { rows: { name: string; icon: React.ElementType; tags: string[] }[] }) {
  return (
    <div className="hidden rounded-lg bg-white p-3 shadow-card lg:block">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-sm font-semibold text-ink">全部分类</h2>
        <Link href="/products" className="text-xs text-accent hover:text-accent-strong">更多</Link>
      </div>
      <div className="space-y-0.5">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Link
              key={row.name}
              href={`/products?keyword=${encodeURIComponent(row.name)}`}
              className="flex items-center gap-2.5 rounded-md px-2 py-2 transition hover:bg-accent-light"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent-light text-accent">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink">{row.name}</div>
                <div className="line-clamp-1 text-xs text-muted">{row.tags.join(" / ")}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  function next() {
    setCurrent((prev) => (prev + 1) % bannerSlides.length);
  }
  function prev() {
    setCurrent((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }

  const slide = bannerSlides[current];

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r shadow-card" style={{ minHeight: 320 }}>
      <div className={`flex h-full min-h-[320px] items-center bg-gradient-to-r ${slide.color} p-8 lg:p-12`}>
        <div className="max-w-md">
          <div className="text-sm font-medium text-white/80">EasyMall</div>
          <h2 className="mt-2 text-3xl font-bold text-white lg:text-4xl">{slide.title}</h2>
          <p className="mt-2 text-sm text-white/80">{slide.subtitle}</p>
          <Link
            href="/products"
            className="mt-4 inline-flex h-9 items-center rounded-md bg-white px-5 text-sm font-medium text-accent transition hover:bg-white/90"
          >
            立即查看
          </Link>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/40"
        aria-label="上一张"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/40"
        aria-label="下一张"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        {bannerSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ProductFlowSection({ products }: { products: ProductVO[] }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">猜你喜欢</h2>
          <p className="text-xs text-muted">根据浏览和购买记录为你推荐</p>
        </div>
        <Link
          href="/products"
          className="rounded-md bg-accent-light px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-lighter"
        >
          查看更多
        </Link>
      </div>

      {products.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} tag={index % 2 === 0 ? "热卖" : "上新"} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="暂无推荐商品" description="可以去商品列表页逛逛，发现更多好物。" />
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, tag }: { product: ProductVO; tag: string }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-lg bg-white border border-transparent transition hover:border-border hover:shadow-float"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
            src={product.image}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">暂无图片</div>
        )}
        <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
          {tag}
        </span>
      </div>
      <div className="p-3">
        <div className="line-clamp-2 text-sm font-medium leading-5 text-ink">{product.name}</div>
        <div className="mt-1 line-clamp-1 text-xs text-muted">{product.categoryName || "精选好货"}</div>
        <div className="mt-2 flex items-end justify-between">
          <div className="text-base font-bold text-accent">{formatCurrency(product.price)}</div>
          <div className="text-xs text-muted">已售 {product.sales}</div>
        </div>
      </div>
    </Link>
  );
}
