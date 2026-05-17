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
import { useMemo } from "react";

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

const quickTags = ["春季女装", "手机换新", "会员满减", "品质家居", "积分好物", "爆款零食"];

const promoPalette = [
  "from-[#ff6d28] to-[#ff8848]",
  "from-[#ff4f92] to-[#ff699b]",
  "from-[#ff8c1f] to-[#ffa53b]",
  "from-[#1e88e5] to-[#45a4f5]",
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
  const heroProduct = mergedProducts[0];
  const heroSecondaryProduct = mergedProducts[1];
  const productFlow = mergedProducts.slice(0, 10);
  const featuredPromos = buildPromos(mergedProducts);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Badge className="bg-[#fff1e8] text-[#ff5a00]">热门搜索</Badge>
          {quickTags.map((tag) => (
            <Link
              key={tag}
              href={`/products?keyword=${encodeURIComponent(tag)}`}
              className="rounded-full bg-[#f8f8f8] px-3 py-1.5 font-medium transition hover:bg-[#fff0e8] hover:text-[#ff5a00]"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[256px_minmax(0,1fr)_256px]">
        <CategorySidebar rows={categoryRows} />
        <div className="space-y-4">
          <HeroBanner heroProduct={heroProduct} heroSecondaryProduct={heroSecondaryProduct} />
          <div className="grid gap-4 md:grid-cols-3">
            <ValuePill title="首屏高效逛" copy="分类、主推、促销位集中到第一屏，搜索入口始终放在最上方。" icon={<Trophy className="h-5 w-5" />} />
            <ValuePill title="优惠和会员联动" copy="领券中心、会员折扣、积分入口继续保留原有业务链路。" icon={<TicketPercent className="h-5 w-5" />} />
            <ValuePill title="商品流更像首页" copy="下方直接进入猜你喜欢和热销区，而不是信息说明页。" icon={<Sparkles className="h-5 w-5" />} />
          </div>
        </div>
        <div className="grid gap-4">
          {featuredPromos.map((promo, index) => (
            <Link
              key={promo.title}
              href={promo.href}
              className={`overflow-hidden rounded-[24px] bg-gradient-to-br ${promoPalette[index]} p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-black leading-tight">{promo.title}</div>
                  <div className="mt-2 text-sm text-white/86">{promo.copy}</div>
                </div>
                {promo.image ? (
                  <img src={promo.image} alt={promo.title} className="h-20 w-20 rounded-[20px] bg-white/20 object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-[20px] bg-white/18" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductFlowSection products={productFlow} />
    </div>
  );
}

function CategorySidebar({ rows }: { rows: { name: string; icon: React.ElementType; tags: string[] }[] }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.35rem] font-black text-slate-950">分类</h2>
        <Link href="/products" className="text-sm font-semibold text-[#ff5a00]">全部</Link>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Link key={row.name} href={`/products?keyword=${encodeURIComponent(row.name)}`} className="flex items-start gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#fff6f0]">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff5a00]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900">{row.name}</div>
                <div className="mt-1 line-clamp-1 text-xs text-slate-500">{row.tags.join(" / ")}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HeroBanner({ heroProduct, heroSecondaryProduct }: { heroProduct?: ProductVO; heroSecondaryProduct?: ProductVO }) {
  return (
    <div className="overflow-hidden rounded-[32px] bg-[#8bb06b] shadow-[0_24px_50px_rgba(139,176,107,0.28)]">
      <div className="grid min-h-[420px] gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div className="flex flex-col justify-between">
          <div>
            <Badge className="bg-white/20 text-white">春季焕新</Badge>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">春回暖<br />衣上新</h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/86">新装上架、一键焕新。首页把分类、促销、搜索和热门推荐重新铺成更熟悉的电商节奏。</p>
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Link href="/products" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#5c7d44] transition hover:bg-[#f4ffe9]">逛热卖商品</Link>
              <Link href="/coupons" className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/12">先领优惠券</Link>
            </div>
            <div className="flex items-center justify-between">
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/28" aria-label="上一张"><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((dot) => (
                  <span key={dot} className={`h-2.5 rounded-full ${dot === 0 ? "w-7 bg-white" : "w-2.5 bg-white/55"}`} />
                ))}
              </div>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/16 text-white transition hover:bg-white/28" aria-label="下一张"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[28px] bg-white/8">
          <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-white/16 blur-xl" />
          <div className="absolute bottom-10 right-8 h-32 w-32 rounded-full bg-[#d4f0bb]/30 blur-xl" />
          {heroProduct?.image ? (
            <img src={heroProduct.image} alt={heroProduct.name} className="relative z-10 max-h-[300px] w-auto max-w-[46%] rounded-[28px] object-contain shadow-[0_18px_40px_rgba(255,255,255,0.18)]" />
          ) : (
            <div className="relative z-10 h-[260px] w-[42%] rounded-[28px] bg-white/25" />
          )}
          {heroSecondaryProduct?.image ? (
            <img src={heroSecondaryProduct.image} alt={heroSecondaryProduct.name} className="relative z-20 -ml-4 mt-20 max-h-[260px] w-auto max-w-[38%] rounded-[28px] object-contain shadow-[0_18px_40px_rgba(255,255,255,0.16)]" />
          ) : (
            <div className="relative z-20 -ml-4 mt-20 h-[220px] w-[34%] rounded-[28px] bg-white/18" />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductFlowSection({ products }: { products: ProductVO[] }) {
  return (
    <section className="rounded-[30px] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[1.7rem] font-black tracking-tight text-slate-950">猜你喜欢</div>
          <p className="mt-1 text-sm text-slate-500">首屏继续往下就是商品流，保留电商首页那种连逛感。</p>
        </div>
        <Link href="/products" className="rounded-full bg-[#fff1e8] px-4 py-2 text-sm font-bold text-[#ff5a00]">查看更多</Link>
      </div>
      {products.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {products.map((product, index) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group overflow-hidden rounded-[24px] bg-[#fafafa] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f3f3]">
                {product.image ? (
                  <img alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={product.image} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#ffe3d3] to-[#fff5ef] text-sm font-semibold text-[#ff6e2d]">EasyMall 推荐</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-xs font-bold text-[#ff5a00]">{index % 2 === 0 ? "热卖" : "上新"}</span>
              </div>
              <div className="p-4">
                <div className="line-clamp-2 min-h-[44px] text-sm font-bold leading-6 text-slate-900">{product.name}</div>
                <div className="mt-2 line-clamp-1 text-xs text-slate-500">{product.categoryName || "EasyMall 精选好货"}</div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-xl font-black text-[#ff5a00]">{formatCurrency(product.price)}</div>
                  <div className="text-xs text-slate-400">已售 {product.sales}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState title="首页商品流暂时加载失败" description="搜索入口、分类导航和促销位仍可使用，避免首页第一屏出现断裂。" />
        </div>
      )}
    </section>
  );
}

function buildPromos(products: ProductVO[]) {
  return [
    { title: "品质家居", copy: "超值优惠", href: "/products?keyword=家居", image: products[2]?.image || products[0]?.image || "" },
    { title: "精致美妆", copy: "品质之选", href: "/products?keyword=美妆", image: products[3]?.image || products[1]?.image || "" },
    { title: "品质数码", copy: "热门爆款", href: "/products?keyword=数码", image: products[4]?.image || products[0]?.image || "" },
    { title: "生活百货", copy: "省钱省心", href: "/products?keyword=百货", image: products[5]?.image || products[1]?.image || "" },
  ];
}

function ValuePill({ title, copy, icon }: { title: string; copy: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="inline-flex rounded-2xl bg-[#fff1e8] p-3 text-[#ff5a00]">{icon}</div>
      <div className="mt-4 text-lg font-black text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-7 text-slate-500">{copy}</p>
    </div>
  );
}
