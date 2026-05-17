"use client";

import Link from "next/link";
import { ArrowRight, Gift, ShieldCheck, ShoppingBag, Sparkles, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { storefrontApi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { CategoryVO, ProductVO } from "@/lib/types";

const fallbackCategories = [
  "手机数码",
  "家用电器",
  "服饰鞋包",
  "美妆个护",
  "食品生鲜",
  "家居生活",
];

const heroModules = [
  {
    title: "限时优惠与会员折扣同步上新",
    description: "搜索商品、先领优惠券，再去结算页组合会员折扣与优惠券抵扣。",
    href: "/coupons",
    action: "先领优惠券",
  },
  {
    title: "积分商城也在同一套会话里联动",
    description: "签到、积分记录、积分兑换与会员等级全部收拢到统一用户中心。",
    href: "/user/points/products",
    action: "去积分商城",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryVO[]>([]);
  const [hotProducts, setHotProducts] = useState<ProductVO[]>([]);
  const [newProducts, setNewProducts] = useState<ProductVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [categoryData, hotData, newData] = await Promise.all([
          storefrontApi.getCategoryTree().catch(() => []),
          storefrontApi.getHotProducts(8).catch(() => []),
          storefrontApi.getNewProducts(8).catch(() => []),
        ]);

        if (!cancelled) {
          setCategories(categoryData);
          setHotProducts(hotData);
          setNewProducts(newData);
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
  }, []);

  if (loading) {
    return <LoadingState label="正在加载首页内容..." />;
  }

  const displayCategories = categories.length
    ? categories.slice(0, 10).map((item) => item.name)
    : fallbackCategories;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        <Card className="rounded-[32px] bg-white/88">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">高频分类</h2>
            <Badge tone="success">首屏发现</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {displayCategories.map((category) => (
              <Link
                key={category}
                href={`/products?keyword=${encodeURIComponent(category)}`}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {category}
              </Link>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[36px] bg-slate-950 p-0 text-white">
          <div className="grid gap-8 px-7 py-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge tone="info" className="bg-white/10 text-white">
                Premium Commerce
              </Badge>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight">
                搜索、分类、优惠和推荐密度重新排好了。
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/72">
                新首页把商城搜索、服务承诺、会员权益和推荐模块放回第一屏附近，
                保持电商信息密度，同时用更干净的层次和卡片系统重做视觉节奏。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products">
                  <Button>
                    进入商品列表
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/coupons">
                  <Button variant="secondary">先领优惠券</Button>
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              {heroModules.map((module, index) => (
                <div
                  key={module.title}
                  className={`rounded-[28px] border border-white/10 p-5 ${
                    index === 0 ? "bg-white/8" : "bg-emerald-500/10"
                  }`}
                >
                  <h3 className="text-xl font-black">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {module.description}
                  </p>
                  <Link
                    href={module.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"
                  >
                    {module.action}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-[32px] bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
          <div className="flex h-full flex-col justify-between">
            <div>
              <Badge className="bg-white/20 text-white">服务承诺</Badge>
              <div className="mt-5 space-y-4">
                <PromiseRow icon={<ShieldCheck className="h-5 w-5" />} title="正品保障" copy="商品信息和库存状态以真实接口为准。" />
                <PromiseRow icon={<TicketPercent className="h-5 w-5" />} title="优惠联动" copy="结算页直接展示优惠券与会员折扣影响。" />
                <PromiseRow icon={<Gift className="h-5 w-5" />} title="积分生态" copy="积分商城、会员等级、签到入口统一在用户中心。" />
              </div>
            </div>
            <Link href="/user/member" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
              查看会员权益
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <FeaturePanel icon={<ShoppingBag className="h-5 w-5" />} title="搜索发现" copy="从首页直接跳到商品搜索、分类筛选和分页浏览。" />
        <FeaturePanel icon={<Sparkles className="h-5 w-5" />} title="焦点推荐" copy="热销与上新商品作为推荐区，接口失败时也会显示稳妥的首屏兜底。" />
        <FeaturePanel icon={<Gift className="h-5 w-5" />} title="会员权益" copy="优惠券、积分商城、签到与会员等级都保留原业务链路。" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProductSection title="热门商品" products={hotProducts} emptyTitle="热门商品暂时加载失败" />
        <ProductSection title="新品推荐" products={newProducts} emptyTitle="新品推荐暂时加载失败" />
      </section>
    </div>
  );
}

function PromiseRow({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/12 p-4">
      <div className="flex items-center gap-3 text-base font-bold">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-white/72">{copy}</p>
    </div>
  );
}

function FeaturePanel({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <Card className="rounded-[30px]">
      <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy}</p>
    </Card>
  );
}

function ProductSection({
  title,
  products,
  emptyTitle,
}: {
  title: string;
  products: ProductVO[];
  emptyTitle: string;
}) {
  if (!products.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description="当前会显示兜底分类和引导入口，避免首页首屏出现破损空白。"
      />
    );
  }

  return (
    <Card className="rounded-[32px]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-black">{title}</h2>
        <Link href="/products" className="text-sm font-semibold text-emerald-700">
          查看全部
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.slice(0, 4).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="rounded-[26px] border border-[var(--border)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100">
              <img alt={product.name} className="h-full w-full object-cover" src={product.image || "/favicon.svg"} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <div className="line-clamp-2 text-sm font-bold text-slate-900">
                  {product.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {product.categoryName || "精选推荐"}
                </div>
              </div>
              <Badge tone="success">已售 {product.sales}</Badge>
            </div>
            <div className="mt-4 text-lg font-black text-rose-600">
              {formatCurrency(product.price)}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
