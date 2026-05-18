"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChartColumn,
  Crown,
  Search,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { useHotProducts, useNewProducts, useProducts } from "@/lib/hooks";
import { formatCurrency, formatSalesVolume } from "@/lib/format";
import { getBrandShowcaseMeta } from "@/lib/brand-showcase";
import type { ProductVO } from "@/lib/types";

function BrandProductCard({ product }: { product: ProductVO }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-border/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd8c6] hover:shadow-[0_24px_46px_-30px_rgba(16,24,40,0.32)]"
    >
      <div className="relative aspect-[4/4.1] overflow-hidden bg-[#f6f7fb]">
        <Image
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          src={product.image || "/favicon.svg"}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent" className="rounded-full px-3 py-1">
            {product.categoryName || "品牌商品"}
          </Badge>
          <span className="text-xs text-muted">已售 {formatSalesVolume(product.sales)}</span>
        </div>
        <div className="mt-3 line-clamp-2 text-[15px] font-semibold leading-6 text-ink">
          {product.name}
        </div>
        <div className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {product.subtitle || `${product.brand || "品牌"} 热门单品，适合在专题会场中继续浏览与比较。`}
        </div>
        <div className="mt-4 text-[1.35rem] font-extrabold text-accent">
          {formatCurrency(product.price)}
        </div>
      </div>
    </Link>
  );
}

function BrandsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get("brand") || "";
  const [draftBrand, setDraftBrand] = useState(selectedBrand);

  const { data: allBrandPage, isLoading: allLoading } = useProducts({ pageNum: 1, pageSize: 80 });
  const { data: brandPage, isLoading: brandLoading } = useProducts({
    pageNum: 1,
    pageSize: 16,
    brand: selectedBrand || undefined,
  });
  const { data: hotProducts = [] } = useHotProducts(12);
  const { data: newProducts = [] } = useNewProducts(12);

  const brandCatalog = useMemo(() => {
    const source = [...(allBrandPage?.records ?? []), ...hotProducts, ...newProducts];
    const grouped = new Map<string, ProductVO[]>();
    source.forEach((product) => {
      const brand = product.brand?.trim();
      if (!brand) return;
      const list = grouped.get(brand) ?? [];
      list.push(product);
      grouped.set(brand, list);
    });

    return Array.from(grouped.entries())
      .map(([brand, products]) => {
        const uniqueProducts = Array.from(new Map(products.map((item) => [item.id, item])).values());
        const totalSales = uniqueProducts.reduce((sum, item) => sum + (item.sales || 0), 0);
        const avgPrice =
          uniqueProducts.reduce((sum, item) => sum + Number(item.price || 0), 0) /
          Math.max(uniqueProducts.length, 1);
        const categories = Array.from(
          new Set(
            uniqueProducts
              .map((item) => item.categoryName?.trim())
              .filter((value): value is string => Boolean(value)),
          ),
        );

        return {
          brand,
          products: uniqueProducts.slice(0, 6),
          allProducts: uniqueProducts,
          hero: uniqueProducts[0],
          totalSales,
          avgPrice,
          categories,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [allBrandPage?.records, hotProducts, newProducts]);

  const selectedBrandEntry = brandCatalog.find((item) => item.brand === selectedBrand);
  const displayedProducts = selectedBrand ? brandPage?.records ?? [] : [];
  const currentBrandMeta = selectedBrand ? getBrandShowcaseMeta(selectedBrand) : null;

  function navigateToBrand(brand: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (brand.trim()) params.set("brand", brand.trim());
    else params.delete("brand");
    router.push(`/brands?${params.toString()}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    navigateToBrand(draftBrand);
  }

  if (allLoading || (selectedBrand && brandLoading)) {
    return <LoadingState label="正在加载品牌会场..." />;
  }

  return (
    <div className="space-y-5">
      <section className="store-section overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_300px] lg:items-end">
          <div>
            <div className="store-kicker">
              <Building2 className="h-4 w-4" />
              品牌会场
            </div>
            <h1 className="mt-2 text-[2rem] font-bold text-ink">
              {selectedBrand ? `${selectedBrand} 品牌专题会场` : "按品牌心智进入更完整的商城陈列路径"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              首页专题、商品列表和品牌会场现在能互相联动，用户可以先按品牌偏好再进入具体商品比较。
            </p>
          </div>
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
            <div className="text-sm font-semibold text-white/78">品牌概览</div>
            <div className="mt-3 text-4xl font-extrabold">
              {selectedBrand ? displayedProducts.length : brandCatalog.length}
            </div>
            <div className="mt-1 text-sm text-white/78">
              {selectedBrand ? "件品牌商品" : "个品牌入口"}
            </div>
          </div>
        </div>
      </section>

      <section className="store-section p-5">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
            <Input
              className="h-11 rounded-full pl-10"
              placeholder="搜索品牌名称"
              value={draftBrand}
              onChange={(event) => setDraftBrand(event.target.value)}
            />
          </div>
          <Button className="h-11 rounded-full px-6" type="submit">
            进入品牌会场
          </Button>
          {selectedBrand ? (
            <Button
              className="h-11 rounded-full px-6"
              onClick={() => router.push("/products?brand=" + encodeURIComponent(selectedBrand))}
              type="button"
              variant="secondary"
            >
              去商品列表细筛
            </Button>
          ) : null}
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="store-section p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Tag className="h-4 w-4 text-accent" />
            热门品牌
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {brandCatalog.slice(0, 8).map((item) => (
              <button
                key={item.brand}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedBrand === item.brand
                    ? "bg-accent text-white"
                    : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
                }`}
                onClick={() => navigateToBrand(item.brand)}
                type="button"
              >
                {item.brand}
              </button>
            ))}
          </div>
        </div>
        <div className="store-section p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            会场建议
          </div>
          <p className="mt-3 text-sm leading-7 text-muted">
            如果你已经知道自己偏好的品牌，先进入品牌会场，再跳转商品列表做价格与排序筛选，会更贴近真实购物路径。
          </p>
        </div>
        <div className="store-section p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Star className="h-4 w-4 text-accent" />
            联动能力
          </div>
          <p className="mt-3 text-sm leading-7 text-muted">
            首页品牌专题、顶部搜索建议和商品列表品牌筛选现在已经能串成同一条路径。
          </p>
        </div>
      </section>

      {selectedBrand ? (
        selectedBrandEntry && displayedProducts.length ? (
          <>
            <section className={`store-section overflow-hidden bg-gradient-to-br ${currentBrandMeta?.tone || "from-[#fff4ea] to-[#ffffff]"} p-6`}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_320px] lg:items-end">
                <div>
                  <div className="store-kicker">
                    <Crown className="h-4 w-4" />
                    品牌故事
                  </div>
                  <h2 className="mt-2 text-[2rem] font-bold text-ink">{selectedBrand}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                    {currentBrandMeta?.story}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentBrandMeta?.tags.map((tag) => (
                      <span key={tag} className={`rounded-full px-4 py-2 text-sm font-semibold ${currentBrandMeta.accent}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <MetricCard label="品牌商品" value={`${displayedProducts.length}`} />
                  <MetricCard label="累计销量" value={formatSalesVolume(selectedBrandEntry.totalSales)} />
                  <MetricCard label="平均价格" value={formatCurrency(selectedBrandEntry.avgPrice)} />
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="store-section p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <ChartColumn className="h-4 w-4 text-accent" />
                  品牌推荐理由
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <div className="rounded-[22px] bg-[#f6f7fb] px-4 py-3">
                    该品牌当前覆盖 {selectedBrandEntry.categories.length} 个品类，适合围绕明确品牌偏好进行快速浏览。
                  </div>
                  <div className="rounded-[22px] bg-[#f6f7fb] px-4 py-3">
                    当前会场中热卖商品的销量与价格区间分布更集中，方便从品牌视角切入后再做精细筛选。
                  </div>
                  <div className="rounded-[22px] bg-[#f6f7fb] px-4 py-3">
                    你还可以直接进入品牌筛选后的商品列表页，继续用价格区间、排序和分类做二次比较。
                  </div>
                </div>
              </div>

              <div className="store-section p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Tag className="h-4 w-4 text-accent" />
                  品类标签
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedBrandEntry.categories.map((category) => (
                    <Link
                      key={category}
                      href={`/products?brand=${encodeURIComponent(selectedBrand)}&keyword=${encodeURIComponent(category)}`}
                      className="rounded-full bg-[#f6f7fb] px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-light hover:text-accent"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/products?brand=${encodeURIComponent(selectedBrand)}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
                >
                  在商品列表中继续筛选
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {displayedProducts.map((product) => (
                <BrandProductCard key={product.id} product={product} />
              ))}
            </section>
          </>
        ) : (
          <EmptyState
            title="当前品牌暂无商品"
            description="可以切换其他品牌，或者返回全部商品继续浏览。"
            action={{ label: "返回全部商品", onClick: () => router.push("/products") }}
          />
        )
      ) : brandCatalog.length ? (
        <>
          <section className="store-section p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Crown className="h-4 w-4 text-accent" />
              品牌榜单
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {brandCatalog.slice(0, 3).map((item, index) => (
                <button
                  key={item.brand}
                  className={`rounded-[26px] p-5 text-left transition hover:-translate-y-0.5 ${
                    [
                      "bg-[linear-gradient(135deg,#fff4ea,#ffffff)]",
                      "bg-[linear-gradient(135deg,#eef5ff,#ffffff)]",
                      "bg-[linear-gradient(135deg,#f7f1ff,#ffffff)]",
                    ][index]
                  }`}
                  onClick={() => navigateToBrand(item.brand)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        TOP {index + 1}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-ink">{item.brand}</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
                      {formatSalesVolume(item.totalSales)}
                    </span>
                  </div>
                  <div className="mt-4 text-sm leading-7 text-muted">
                    {getBrandShowcaseMeta(item.brand).story}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            {brandCatalog.slice(0, 6).map((item) => {
              const meta = getBrandShowcaseMeta(item.brand);
              return (
                <button
                  key={item.brand}
                  className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${meta.tone} p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_24px_46px_-30px_rgba(16,24,40,0.25)]`}
                  onClick={() => navigateToBrand(item.brand)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        Brand Hall
                      </div>
                      <div className="mt-2 text-2xl font-bold text-ink">{item.brand}</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
                      {item.products.length} 件精选
                    </span>
                  </div>
                  <div className="mt-4 line-clamp-3 text-sm leading-7 text-muted">{meta.story}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meta.tags.map((tag) => (
                      <span key={tag} className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.accent}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {item.products.slice(0, 2).map((product) => (
                      <div key={product.id} className="rounded-[22px] bg-white p-3">
                        <div className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-ink">
                          {product.name}
                        </div>
                        <div className="mt-3 text-sm font-extrabold text-accent">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </section>
        </>
      ) : (
        <EmptyState
          title="暂无品牌专题"
          description="当前还没有足够的品牌商品聚合数据，稍后再来看看。"
        />
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white/80 px-4 py-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-xl font-extrabold text-ink">{value}</div>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense fallback={<LoadingState label="正在准备品牌会场..." />}>
      <BrandsContent />
    </Suspense>
  );
}
