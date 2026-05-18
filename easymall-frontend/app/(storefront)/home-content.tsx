"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Gift,
  HeartHandshake,
  MonitorSmartphone,
  ShieldCheck,
  ShoppingBag,
  Shirt,
  Sparkles,
  Star,
  TicketPercent,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useCategoryTree, useHotProducts, useNewProducts } from "@/lib/hooks";
import {
  formatCurrency,
  formatDiscountLabel,
  formatSalesVolume,
} from "@/lib/format";
import type { CategoryVO, ProductVO } from "@/lib/types";

const fallbackCategories = [
  { name: "女装上新", icon: Shirt, description: "轻盈通勤与松弛感穿搭" },
  { name: "数码潮电", icon: MonitorSmartphone, description: "手机、耳机、笔电与配件" },
  { name: "品质家居", icon: ShoppingBag, description: "小家电、收纳、餐厨生活" },
  { name: "美妆个护", icon: Sparkles, description: "护肤彩妆与香氛礼盒" },
];

const bannerSlides = [
  {
    eyebrow: "春季焕新",
    title: "把人气爆款和新人礼券，一次装进购物清单",
    description: "首页直达分类、热卖与精选活动，少逛弯路，多逛到点子上。",
    stats: ["限时满 199 减 30", "新人礼包 188 元", "会员日积分 2 倍返"],
    cta: "去抢爆款",
    href: "/products",
    palette: "from-[#1d2433] via-[#252e41] to-[#ef4e23]",
  },
  {
    eyebrow: "品牌闪购",
    title: "数码、家电、个护同步补贴，促销氛围更像真实商城",
    description: "把热卖、新品、券和售后承诺放进同一购物路径，提升下单决策效率。",
    stats: ["24 小时闪降", "官方直营补贴", "热门品类专区"],
    cta: "查看会场",
    href: "/products?keyword=手机数码",
    palette: "from-[#3f2b1d] via-[#7a3715] to-[#ff874f]",
  },
  {
    eyebrow: "品质生活",
    title: "从家居小电到礼赠好物，兼顾价格吸引力与陈列质感",
    description: "更强的信息密度、更清晰的价格层次和更完整的运营模块，让首页不再像模板站。",
    stats: ["爆款榜单", "新人专区", "满额包邮"],
    cta: "发现好物",
    href: "/products?keyword=家居生活",
    palette: "from-[#21314f] via-[#324d7a] to-[#f59e0b]",
  },
];

const couponCards = [
  { value: "¥30", rule: "满 199 可用", hint: "数码家电专享", accent: "from-[#ffedd5] to-[#fff7ed]" },
  { value: "85 折", rule: "最高减 80", hint: "美妆个护爆款", accent: "from-[#fef3f2] to-[#fff7ed]" },
  { value: "¥60", rule: "满 399 可用", hint: "居家品质专场", accent: "from-[#eef2ff] to-[#f8fafc]" },
];

const serviceItems = [
  { title: "48 小时极速发货", description: "热门仓次日优先出库", icon: Truck },
  { title: "正品与售后保障", description: "支持质检与 30 天无忧退换", icon: ShieldCheck },
  { title: "搭配灵感推荐", description: "热卖、新品、猜你喜欢联动陈列", icon: HeartHandshake },
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
    [...hotProducts, ...newProducts].forEach((product) => deduped.set(product.id, product));
    return Array.from(deduped.values());
  }, [hotProducts, newProducts]);

  const categoryRows = useMemo(() => {
    const fromServer = categories.slice(0, 8).map((item, index) => ({
      name: item.name,
      icon: fallbackCategories[index % fallbackCategories.length].icon,
      description:
        item.children?.slice(0, 2).map((child) => child.name).join(" / ") ||
        fallbackCategories[index % fallbackCategories.length].description,
    }));
    return fromServer.length ? fromServer : fallbackCategories;
  }, [categories]);

  const flashSaleProducts = hotProducts.slice(0, 4);
  const bestSellerProducts = hotProducts.slice(0, 8);
  const newArrivalProducts = newProducts.slice(0, 8);
  const recommendProducts = mergedProducts.slice(0, 10);
  const brandShowcases = useMemo(() => {
    const grouped = new Map<string, ProductVO[]>();
    mergedProducts.forEach((product) => {
      const brand = product.brand?.trim();
      if (!brand) return;
      const items = grouped.get(brand) ?? [];
      items.push(product);
      grouped.set(brand, items);
    });

    return Array.from(grouped.entries())
      .slice(0, 3)
      .map(([brand, items], index) => ({
        brand,
        hero: items[0],
        products: items.slice(0, 3),
        tone: [
          "from-[#fff4ea] to-[#ffffff]",
          "from-[#eef5ff] to-[#ffffff]",
          "from-[#f7f1ff] to-[#ffffff]",
        ][index % 3],
      }));
  }, [mergedProducts]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CategorySidebar rows={categoryRows} />
        <div className="space-y-4">
          <HeroCarousel />
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="store-section p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="store-kicker">
                    <TicketPercent className="h-4 w-4" />
                    领券中心
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-ink">先领券，再逛热卖区</h2>
                  <p className="mt-2 max-w-xl text-sm text-muted">
                    真实商城感不只来自视觉，还来自价格层次与促销路径。把券、分类、爆款和服务保障串起来，转化更自然。
                  </p>
                </div>
                <Link
                  href="/coupons"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                >
                  立即领券
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {couponCards.map((card) => (
                  <div
                    key={card.value}
                    className={`overflow-hidden rounded-2xl bg-gradient-to-br ${card.accent} p-4`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      EasyMall Coupon
                    </div>
                    <div className="mt-3 text-3xl font-extrabold text-ink">{card.value}</div>
                    <div className="mt-1 text-sm font-medium text-ink">{card.rule}</div>
                    <div className="mt-4 text-xs text-muted">{card.hint}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="store-section p-5">
              <div className="store-kicker">
                <Sparkles className="h-4 w-4" />
                新人专区
              </div>
              <h2 className="mt-2 text-xl font-bold text-ink">入会礼与积分权益一起领</h2>
              <div className="mt-4 space-y-3">
                {[
                  "注册即得 188 元新人礼包",
                  "购物返积分，可抵扣积分商城好物",
                  "会员日热卖商品额外折扣",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#fff7f2] px-4 py-3 text-sm text-ink">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-accent">
                      <Gift className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/user/member"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
              >
                查看会员权益
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionFrame
        title="限时秒杀"
        subtitle="热门商品先抢先得，突出价格和销量层次，让首屏更有成交氛围。"
        actionHref="/products"
        actionLabel="进入秒杀会场"
        icon={<Flame className="h-4 w-4" />}
        tone="warm"
      >
        {flashSaleProducts.length ? (
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-[28px] bg-[linear-gradient(180deg,#1d2433_0%,#232d41_100%)] p-6 text-white">
              <div className="store-pill bg-white/12 text-white">TODAY&apos;S HOT SALE</div>
              <h3 className="mt-4 text-3xl font-bold leading-tight">今晚 20:00 爆款限时放价</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                重点突出价格、原价、销量与优惠动作，让首页更接近真实电商大促页，而不是模板式展示。
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {["00", "36", "18"].map((item, index) => (
                  <div key={item} className="rounded-2xl bg-white/10 px-2 py-3">
                    <div className="text-[1.6rem] font-bold">{item}</div>
                    <div className="mt-1 text-xs text-white/60">{["时", "分", "秒"][index]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {flashSaleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} variant="flash" tag={index === 0 ? "爆款直降" : "限时抢"} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="暂无秒杀商品" description="当前还没有可展示的秒杀活动，稍后再来看看。" />
        )}
      </SectionFrame>

      <SectionFrame
        title="热卖榜单"
        subtitle="把销量、库存、折扣和卖点聚合在一起，增强商品陈列的信息密度。"
        actionHref="/products"
        actionLabel="查看热卖商品"
        icon={<Star className="h-4 w-4" />}
      >
        <ProductGrid products={bestSellerProducts} tag="热卖榜" />
      </SectionFrame>

      <SectionFrame
        title="品牌与专题会场"
        subtitle="把品牌陈列和专题会场补进首页，让用户除了逛商品，还能按品牌心智进入更有运营感的区域。"
        actionHref="/products"
        actionLabel="查看品牌商品"
        icon={<ShoppingBag className="h-4 w-4" />}
      >
        {brandShowcases.length ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {brandShowcases.map((showcase) => (
              <Link
                key={showcase.brand}
                href={`/brands?brand=${encodeURIComponent(showcase.brand)}`}
                className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${showcase.tone} p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_46px_-30px_rgba(16,24,40,0.25)]`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Brand Focus</div>
                    <div className="mt-2 text-2xl font-bold text-ink">{showcase.brand}</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
                    专题会场
                  </span>
                </div>
                <div className="mt-4 line-clamp-2 text-sm leading-7 text-muted">
                  {showcase.hero.subtitle || `${showcase.brand} 热卖与推荐单品合集，适合从品牌偏好直接进入购物。`}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {showcase.products.map((product) => (
                    <div key={product.id} className="rounded-[22px] bg-white p-3">
                      <div className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-ink">
                        {product.name}
                      </div>
                      <div className="mt-3 text-sm font-extrabold text-accent">{formatCurrency(product.price)}</div>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无品牌专题" description="等更多品牌商品同步后，这里会展示专题会场。" />
        )}
      </SectionFrame>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <SectionFrame
          title="新品上架"
          subtitle="新品区域突出上新节奏、品类气质和到手价，让首页不止一个商品网格。"
          actionHref="/products"
          actionLabel="逛新品"
          icon={<Sparkles className="h-4 w-4" />}
        >
          <ProductGrid products={newArrivalProducts} tag="新品" columns="md:grid-cols-2 xl:grid-cols-2" />
        </SectionFrame>

        <div className="store-section p-6">
          <div className="store-kicker">
            <ShieldCheck className="h-4 w-4" />
            服务保障
          </div>
          <h2 className="mt-2 text-2xl font-bold text-ink">把售后承诺放在购物链路里，而不是藏进页脚</h2>
          <div className="mt-5 space-y-3">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl bg-[#f7f8fc] p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-base font-semibold text-ink">{item.title}</div>
                      <div className="mt-1 text-sm leading-6 text-muted">{item.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,#fff4ea,#ffffff)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              <Clock3 className="h-4 w-4" />
              今日运营提醒
            </div>
            <div className="mt-3 space-y-2 text-sm text-ink">
              <div>20:00 后家电、数码会场价格更新</div>
              <div>领券后下单更划算，购物车与结算页可继续使用优惠券</div>
              <div>热门爆款库存实时变化，建议先加购再挑选搭配</div>
            </div>
          </div>
        </div>
      </section>

      <SectionFrame
        title="猜你喜欢"
        subtitle="热卖与新品混排推荐，补出更完整的浏览到转化路径。"
        actionHref="/products"
        actionLabel="继续逛逛"
        icon={<HeartHandshake className="h-4 w-4" />}
      >
        <ProductGrid products={recommendProducts} tag="推荐" columns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" />
      </SectionFrame>
    </div>
  );
}

function CategorySidebar({
  rows,
}: {
  rows: { name: string; icon: React.ElementType; description: string }[];
}) {
  return (
    <div className="store-section h-fit p-4">
      <div className="flex items-center justify-between pb-3">
        <div>
          <div className="store-kicker">
            <ShoppingBag className="h-4 w-4" />
            品类导航
          </div>
          <h2 className="mt-2 text-xl font-bold text-ink">全部分类</h2>
        </div>
        <Link href="/products" className="text-sm font-semibold text-accent transition hover:text-accent-strong">
          全部商品
        </Link>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Link
              key={row.name}
              href={`/products?keyword=${encodeURIComponent(row.name)}`}
              className="group flex items-center gap-3 rounded-[22px] border border-transparent bg-[#f8f9fc] px-4 py-3 transition hover:border-[#ffd9c8] hover:bg-white hover:shadow-[0_18px_32px_-28px_rgba(16,24,40,0.45)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">{row.name}</div>
                <div className="mt-1 line-clamp-1 text-xs text-muted">{row.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted transition group-hover:text-accent" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const slide = bannerSlides[current];

  function next() {
    setCurrent((prev) => (prev + 1) % bannerSlides.length);
  }

  function prev() {
    setCurrent((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }

  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${slide.palette} p-6 shadow-[0_28px_70px_-38px_rgba(16,24,40,0.65)] md:p-8 lg:p-10`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div>
          <div className="store-pill bg-white/14 text-white">{slide.eyebrow}</div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-[2.7rem]">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
            {slide.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {slide.stats.map((item) => (
              <span key={item} className="store-pill bg-white/12 text-white">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={slide.href}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition hover:bg-white/90"
            >
              {slide.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/coupons"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/24 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/16"
            >
              先领优惠券
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/12 p-5 text-white backdrop-blur-sm">
          <div className="text-sm font-semibold text-white/88">今日会场重点</div>
          <div className="mt-4 space-y-3">
            {[
              ["品牌补贴", "数码家电享满减与换新优惠"],
              ["新人专享", "首单优惠、加赠、积分一起领"],
              ["热卖榜单", "更高密度展示爆款价格与销量"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl bg-white/10 p-4">
                <div className="font-semibold">{title}</div>
                <div className="mt-1 text-sm leading-6 text-white/70">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/36"
        aria-label="上一张"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-black/36"
        aria-label="下一张"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="relative mt-8 flex items-center gap-2">
        {bannerSlides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition ${
              current === index ? "w-8 bg-white" : "w-2 bg-white/40"
            }`}
            aria-label={`切换到第 ${index + 1} 张活动图`}
          />
        ))}
      </div>
    </div>
  );
}

function SectionFrame({
  title,
  subtitle,
  actionHref,
  actionLabel,
  icon,
  tone = "neutral",
  children,
}: {
  title: string;
  subtitle: string;
  actionHref: string;
  actionLabel: string;
  icon: React.ReactNode;
  tone?: "neutral" | "warm";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`store-section p-6 ${
        tone === "warm" ? "bg-[linear-gradient(180deg,#fff7f2_0%,rgba(255,255,255,0.96)_24%)]" : ""
      }`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="store-kicker">
            {icon}
            精选模块
          </div>
          <h2 className="mt-2 text-[1.75rem] font-bold text-ink">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{subtitle}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProductGrid({
  products,
  tag,
  columns = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  products: ProductVO[];
  tag: string;
  columns?: string;
}) {
  if (!products.length) {
    return <EmptyState title="暂无商品" description="商品内容正在补充中，稍后再来看看。" />;
  }

  return (
    <div className={`grid gap-4 ${columns}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} tag={index % 3 === 0 ? tag : "精选"} />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  tag,
  variant = "default",
}: {
  product: ProductVO;
  tag: string;
  variant?: "default" | "flash";
}) {
  const discount = formatDiscountLabel(product.originalPrice, product.price);
  const isLowStock = product.stock > 0 && product.stock <= 20;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd8c6] hover:shadow-[0_26px_50px_-32px_rgba(16,24,40,0.45)]"
    >
      <div className="relative aspect-[4/4.25] overflow-hidden bg-[#f6f7fb]">
        {product.image ? (
          <Image
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 20vw"
            src={product.image}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">暂无图片</div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-[#1d2433] px-3 py-1 text-[11px] font-semibold text-white">
            {tag}
          </span>
          {discount ? (
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
              {discount}
            </span>
          ) : null}
        </div>
        {variant === "flash" ? (
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(23,24,28,0.72))] px-3 pb-3 pt-8 text-white">
            <div className="flex items-center gap-2 text-xs text-white/85">
              <Clock3 className="h-3.5 w-3.5" />
              限时到手价
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent" className="rounded-full px-3 py-1">
            {product.categoryName || "精选好货"}
          </Badge>
          <div className="text-xs text-muted">{product.brand || "品牌直供"}</div>
        </div>

        <div className="mt-3 line-clamp-2 text-[15px] font-semibold leading-6 text-ink">
          {product.name}
        </div>
        <div className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {product.subtitle || "高频热卖推荐，兼顾颜值、性能与到手价。"}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[1.35rem] font-extrabold text-accent">
              {formatCurrency(product.price)}
            </div>
            {product.originalPrice > product.price ? (
              <div className="mt-1 text-xs text-muted line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            ) : (
              <div className="mt-1 text-xs text-muted">价格稳定，放心入手</div>
            )}
          </div>
          <div className="text-right text-xs text-muted">
            <div>已售 {formatSalesVolume(product.sales)}</div>
            <div>{product.stock > 0 ? `库存 ${product.stock}` : "已售罄"}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">包邮补贴</span>
          <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">7 天价保</span>
          {isLowStock ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">库存紧张</span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">现货充足</span>
          )}
        </div>
      </div>
    </Link>
  );
}
