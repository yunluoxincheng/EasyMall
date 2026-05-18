"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  BadgePercent,
  Flame,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Pagination } from "@/components/ui/pagination";
import { useCategoryTree, useProducts } from "@/lib/hooks";
import { formatCurrency, formatDiscountLabel, formatSalesVolume } from "@/lib/format";
import type { CategoryVO, ProductQuery, ProductVO } from "@/lib/types";

const sortOptions = [
  { value: "default", label: "综合推荐" },
  { value: "sales_desc", label: "销量优先" },
  { value: "price_asc", label: "价格从低到高" },
  { value: "price_desc", label: "价格从高到低" },
  { value: "newest", label: "最新上架" },
];

const presetPriceRanges = [
  { label: "全部价格", min: "", max: "" },
  { label: "100 元内", min: "0", max: "100" },
  { label: "100 - 300 元", min: "100", max: "300" },
  { label: "300 - 800 元", min: "300", max: "800" },
  { label: "800 元以上", min: "800", max: "" },
];

function mapSortQuery(sort: string): Pick<ProductQuery, "sortBy" | "sortOrder"> {
  switch (sort) {
    case "sales_desc":
      return { sortBy: "sales", sortOrder: "desc" };
    case "price_asc":
      return { sortBy: "price", sortOrder: "asc" };
    case "price_desc":
      return { sortBy: "price", sortOrder: "desc" };
    case "newest":
      return { sortBy: "createTime", sortOrder: "desc" };
    default:
      return {};
  }
}

function ProductCard({ product }: { product: ProductVO }) {
  const discount = formatDiscountLabel(product.originalPrice, product.price);
  const stockTone =
    product.stock > 0 ? (product.stock <= 20 ? "warning" : "success") : "danger";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-border/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#ffd8c6] hover:shadow-[0_26px_50px_-32px_rgba(16,24,40,0.42)]"
    >
      <div className="relative aspect-[4/4.2] overflow-hidden bg-[#f6f7fb]">
        <Image
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          src={product.image || "/favicon.svg"}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-[#1d2433] px-3 py-1 text-[11px] font-semibold text-white">
            {product.sales > 200 ? "热卖爆款" : "精选推荐"}
          </span>
          {discount ? (
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
              {discount}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent" className="rounded-full px-3 py-1">
            {product.categoryName || "精选商品"}
          </Badge>
          <span className="text-xs text-muted">{product.brand || "品牌直供"}</span>
        </div>

        <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-6 text-ink">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
          {product.subtitle || "兼顾品质、到手价与日常实用度的精选好物。"}
        </p>

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
              <div className="mt-1 text-xs text-muted">价格稳定，支持价保</div>
            )}
          </div>
          <div className="text-right text-xs text-muted">
            <div>已售 {formatSalesVolume(product.sales)}</div>
            <div>{product.stock > 0 ? `库存 ${product.stock}` : "已售罄"}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge tone={stockTone} className="rounded-full px-3 py-1">
            {product.stock > 0 ? (product.stock <= 20 ? "库存紧张" : "现货充足") : "暂时缺货"}
          </Badge>
          <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">7 天价保</span>
          <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-muted">极速发货</span>
        </div>
      </div>
    </Link>
  );
}

function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const keywordQuery = searchParams.get("keyword") || "";
  const categoryQuery = Number(searchParams.get("categoryId") || "0");
  const sortQuery = searchParams.get("sort") || "default";
  const brandQuery = searchParams.get("brand") || "";
  const minPriceQuery = searchParams.get("minPrice") || "";
  const maxPriceQuery = searchParams.get("maxPrice") || "";

  const [keyword, setKeyword] = useState(keywordQuery);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryQuery > 0 ? String(categoryQuery) : "",
  );
  const [selectedBrand, setSelectedBrand] = useState(brandQuery);
  const [priceDraft, setPriceDraft] = useState({ min: minPriceQuery, max: maxPriceQuery });

  useEffect(() => {
    setKeyword(keywordQuery);
  }, [keywordQuery]);

  useEffect(() => {
    setSelectedCategory(categoryQuery > 0 ? String(categoryQuery) : "");
  }, [categoryQuery]);

  useEffect(() => {
    setSelectedBrand(brandQuery);
  }, [brandQuery]);

  useEffect(() => {
    setPriceDraft({ min: minPriceQuery, max: maxPriceQuery });
  }, [minPriceQuery, maxPriceQuery]);

  const { data: categories = [] } = useCategoryTree();
  const { data: productPage, isLoading: loading } = useProducts({
    pageNum: page,
    pageSize: 12,
    keyword: keywordQuery || undefined,
    categoryId: categoryQuery > 0 ? categoryQuery : undefined,
    brand: brandQuery || undefined,
    minPrice: minPriceQuery ? Number(minPriceQuery) : undefined,
    maxPrice: maxPriceQuery ? Number(maxPriceQuery) : undefined,
    ...mapSortQuery(sortQuery),
  });

  const products = productPage?.records ?? [];
  const total = productPage?.total ?? 0;

  const categoryOptions = useMemo(() => {
    const flattened = (categories as CategoryVO[]).flatMap((item) => [item, ...(item.children || [])]);
    return flattened.slice(0, 16);
  }, [categories]);

  const brandOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        products
          .map((item) => item.brand?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );
    if (selectedBrand && !values.includes(selectedBrand)) {
      values.unshift(selectedBrand);
    }
    return values.slice(0, 12);
  }, [products, selectedBrand]);

  const activePriceLabel = useMemo(() => {
    const matched = presetPriceRanges.find(
      (item) => item.min === minPriceQuery && item.max === maxPriceQuery,
    );
    return matched?.label ||
      (minPriceQuery || maxPriceQuery
        ? `${minPriceQuery || "0"} - ${maxPriceQuery || "∞"} 元`
        : "全部价格");
  }, [maxPriceQuery, minPriceQuery]);

  const resultSummary = useMemo(() => {
    const fragments = [];
    if (keywordQuery) fragments.push(`关键词“${keywordQuery}”`);
    if (selectedCategory) fragments.push("当前分类");
    if (brandQuery) fragments.push(`品牌 ${brandQuery}`);
    if (minPriceQuery || maxPriceQuery) fragments.push(`价格 ${activePriceLabel}`);
    return fragments.length
      ? `${fragments.join(" · ")} 相关结果`
      : "按分类、品牌、价格和热度快速挑选";
  }, [activePriceLabel, brandQuery, keywordQuery, minPriceQuery, maxPriceQuery, selectedCategory]);

  function updateQuery(next: {
    keyword?: string;
    categoryId?: string;
    page?: number;
    sort?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.keyword !== undefined) {
      if (next.keyword) params.set("keyword", next.keyword);
      else params.delete("keyword");
    }

    if (next.categoryId !== undefined) {
      if (next.categoryId) params.set("categoryId", next.categoryId);
      else params.delete("categoryId");
    }

    if (next.sort !== undefined) {
      if (next.sort === "default") params.delete("sort");
      else params.set("sort", next.sort);
    }

    if (next.brand !== undefined) {
      if (next.brand) params.set("brand", next.brand);
      else params.delete("brand");
    }

    if (next.minPrice !== undefined) {
      if (next.minPrice) params.set("minPrice", next.minPrice);
      else params.delete("minPrice");
    }

    if (next.maxPrice !== undefined) {
      if (next.maxPrice) params.set("maxPrice", next.maxPrice);
      else params.delete("maxPrice");
    }

    if (next.page !== undefined) params.set("page", String(next.page));

    router.push(`/products?${params.toString()}`);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    updateQuery({
      keyword: keyword.trim(),
      categoryId: selectedCategory,
      sort: sortQuery,
      brand: selectedBrand,
      minPrice: priceDraft.min,
      maxPrice: priceDraft.max,
      page: 1,
    });
  }

  function applyPresetPrice(min: string, max: string) {
    setPriceDraft({ min, max });
    updateQuery({
      keyword: keywordQuery,
      categoryId: selectedCategory,
      sort: sortQuery,
      brand: selectedBrand,
      minPrice: min,
      maxPrice: max,
      page: 1,
    });
  }

  if (loading) {
    return <LoadingState label="正在加载商品列表..." />;
  }

  return (
    <div className="space-y-5">
      <section className="store-section overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_300px] lg:items-end">
          <div>
            <div className="store-kicker">
              <SlidersHorizontal className="h-4 w-4" />
              商品列表
            </div>
            <h1 className="mt-2 text-[2rem] font-bold text-ink">把筛选真正做成一套可连续使用的商城检索系统</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              这一版把价格区间、品牌、分类和真实排序整合到同一个双栏布局里，更接近成熟商城在大屏端的筛选体验。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["侧边筛选栏", "品牌会场联动", "价格区间筛选", "后端真实排序"].map((item) => (
                <span key={item} className="store-pill bg-[#fff7f2]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#1d2433,#ef4e23)] p-5 text-white">
            <div className="text-sm font-semibold text-white/78">结果概览</div>
            <div className="mt-3 text-4xl font-extrabold">{total}</div>
            <div className="mt-1 text-sm text-white/78">件在售商品</div>
            <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/82">
              {resultSummary}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <FilterSection title="分类筛选" icon={<Tag className="h-4 w-4 text-accent" />}>
            <div className="flex flex-col gap-2">
              <FilterListButton
                active={!selectedCategory}
                label="全部分类"
                onClick={() => {
                  setSelectedCategory("");
                  updateQuery({
                    categoryId: "",
                    keyword: keywordQuery,
                    sort: sortQuery,
                    brand: selectedBrand,
                    minPrice: minPriceQuery,
                    maxPrice: maxPriceQuery,
                    page: 1,
                  });
                }}
              />
              {categoryOptions.map((item) => (
                <FilterListButton
                  key={item.id}
                  active={selectedCategory === String(item.id)}
                  label={item.name}
                  onClick={() => {
                    setSelectedCategory(String(item.id));
                    updateQuery({
                      categoryId: String(item.id),
                      keyword: keywordQuery,
                      sort: sortQuery,
                      brand: selectedBrand,
                      minPrice: minPriceQuery,
                      maxPrice: maxPriceQuery,
                      page: 1,
                    });
                  }}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="品牌筛选" icon={<Sparkles className="h-4 w-4 text-accent" />}>
            <div className="flex flex-wrap gap-2">
              <ChipButton
                active={!selectedBrand}
                label="全部品牌"
                onClick={() => {
                  setSelectedBrand("");
                  updateQuery({
                    brand: "",
                    keyword: keywordQuery,
                    categoryId: selectedCategory,
                    sort: sortQuery,
                    minPrice: minPriceQuery,
                    maxPrice: maxPriceQuery,
                    page: 1,
                  });
                }}
              />
              {brandOptions.length ? (
                brandOptions.map((brand) => (
                  <ChipButton
                    key={brand}
                    active={selectedBrand === brand}
                    label={brand}
                    onClick={() => {
                      setSelectedBrand(brand);
                      updateQuery({
                        brand,
                        keyword: keywordQuery,
                        categoryId: selectedCategory,
                        sort: sortQuery,
                        minPrice: minPriceQuery,
                        maxPrice: maxPriceQuery,
                        page: 1,
                      });
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted">当前结果中暂无品牌标签</p>
              )}
            </div>
          </FilterSection>

          <FilterSection title="价格区间" icon={<BadgePercent className="h-4 w-4 text-accent" />}>
            <div className="flex flex-wrap gap-2">
              {presetPriceRanges.map((item) => (
                <ChipButton
                  key={item.label}
                  active={item.min === minPriceQuery && item.max === maxPriceQuery}
                  label={item.label}
                  onClick={() => applyPresetPrice(item.min, item.max)}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Input
                className="h-10 rounded-2xl"
                inputMode="numeric"
                placeholder="最低价"
                value={priceDraft.min}
                onChange={(event) =>
                  setPriceDraft((prev) => ({
                    ...prev,
                    min: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
              />
              <Input
                className="h-10 rounded-2xl"
                inputMode="numeric"
                placeholder="最高价"
                value={priceDraft.max}
                onChange={(event) =>
                  setPriceDraft((prev) => ({
                    ...prev,
                    max: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
              />
            </div>
            <Button
              className="mt-3 h-10 w-full rounded-full"
              onClick={() =>
                updateQuery({
                  keyword: keywordQuery,
                  categoryId: selectedCategory,
                  sort: sortQuery,
                  brand: selectedBrand,
                  minPrice: priceDraft.min,
                  maxPrice: priceDraft.max,
                  page: 1,
                })
              }
              type="button"
            >
              应用自定义价格
            </Button>
          </FilterSection>

          <FilterSection title="当前筛选" icon={<Flame className="h-4 w-4 text-accent" />}>
            <div className="flex flex-wrap gap-2">
              {keywordQuery ? (
                <ActiveFilter label={`关键词：${keywordQuery}`} onClick={() => updateQuery({ keyword: "", page: 1 })} />
              ) : null}
              {selectedCategory ? (
                <ActiveFilter label="分类已生效" onClick={() => updateQuery({ categoryId: "", page: 1 })} />
              ) : null}
              {brandQuery ? (
                <ActiveFilter label={`品牌：${brandQuery}`} onClick={() => updateQuery({ brand: "", page: 1 })} />
              ) : null}
              {minPriceQuery || maxPriceQuery ? (
                <ActiveFilter label={`价格：${activePriceLabel}`} onClick={() => updateQuery({ minPrice: "", maxPrice: "", page: 1 })} />
              ) : null}
              <Button className="rounded-full px-5" onClick={() => router.push("/products")} variant="secondary">
                清空全部筛选
              </Button>
            </div>
          </FilterSection>
        </aside>

        <div className="space-y-4">
          <section className="store-section p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <form className="flex flex-1 flex-col gap-3 md:flex-row" onSubmit={handleSearch}>
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                    <Input
                      className="h-11 rounded-full pl-10"
                      placeholder="搜索商品、品牌、场景关键词"
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                    />
                  </div>
                  <Button className="h-11 rounded-full px-6" type="submit">
                    搜索商品
                  </Button>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink">排序</span>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        sortQuery === option.value
                          ? "bg-accent text-white"
                          : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
                      }`}
                      onClick={() =>
                        updateQuery({
                          sort: option.value,
                          categoryId: selectedCategory,
                          keyword: keywordQuery,
                          brand: selectedBrand,
                          minPrice: minPriceQuery,
                          maxPrice: maxPriceQuery,
                          page: 1,
                        })
                      }
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <InsightCard
                  icon={<Flame className="h-4 w-4 text-accent" />}
                  title="热卖挑选建议"
                  description="如果你没有明确目标，先看销量和折扣，再结合库存与发货标签，更接近真实下单决策。"
                />
                <InsightCard
                  icon={<ArrowUpDown className="h-4 w-4 text-accent" />}
                  title="排序说明"
                  description="当前排序已通过接口参数接入后端，价格和销量排序不再只是客户端视觉排序。"
                />
                <InsightCard
                  icon={<Sparkles className="h-4 w-4 text-accent" />}
                  title="路径联动"
                  description="品牌会场、搜索页和商品列表共用同一套筛选逻辑，可以更顺畅地从运营入口走向成交。"
                />
              </div>
            </div>
          </section>

          {products.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                page={page}
                pageSize={12}
                total={total}
                onPageChange={(nextPage) =>
                  updateQuery({
                    page: nextPage,
                    keyword: keywordQuery,
                    categoryId: selectedCategory,
                    sort: sortQuery,
                    brand: selectedBrand,
                    minPrice: minPriceQuery,
                    maxPrice: maxPriceQuery,
                  })
                }
              />
            </>
          ) : (
            <EmptyState
              title="暂无商品"
              description="当前搜索或筛选条件下没有可展示的商品，试试清空筛选、换个品牌或调整价格区间。"
              action={{
                label: "清空筛选",
                onClick: () => router.push("/products"),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="store-section p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FilterListButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`w-full rounded-[18px] px-4 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-accent text-white"
          : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent text-white"
          : "bg-[#f6f7fb] text-ink hover:bg-accent-light hover:text-accent"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ActiveFilter({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-full bg-accent-light px-4 py-2 text-sm font-medium text-accent"
      onClick={onClick}
      type="button"
    >
      {label} ×
    </button>
  );
}

function InsightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] bg-[#f6f7fb] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState label="正在加载商品列表..." />}>
      <ProductListContent />
    </Suspense>
  );
}
